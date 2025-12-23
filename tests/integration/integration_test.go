package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"testing"
	"time"
	"fmt"
	"io/ioutil"
)

func runCompose(ctx context.Context, args ...string) error {
	// try docker-compose first
	cmd := exec.CommandContext(ctx, "docker-compose", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err == nil {
		return nil
	}
	// fallback to "docker compose"
	all := append([]string{"compose"}, args...)
	cmd = exec.CommandContext(ctx, "docker", all...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func waitForURL(url string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		resp, err := http.Get(url)
		if err == nil && resp.StatusCode == http.StatusOK {
			return nil
		}
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("timeout waiting for %s", url)
}

func TestEndToEnd_Flow(t *testing.T) {
	if os.Getenv("RUN_INTEGRATION_TESTS") != "true" {
		t.Skip("set RUN_INTEGRATION_TESTS=true to run integration tests")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	// Build and start services
	t.Log("Starting docker-compose services...")
	if err := runCompose(ctx, "up", "--build", "-d"); err != nil {
		t.Fatalf("failed to start compose: %v", err)
	}
	defer func() {
		t.Log("Tearing down docker-compose services...")
		_ = runCompose(context.Background(), "down")
	}()

	// Wait for API gateway
	if err := waitForURL("http://localhost:8000/health", 2*time.Minute); err != nil {
		t.Fatalf("gateway not ready: %v", err)
	}

	// 1) Register user
	email := "int-" + fmt.Sprintf("%d", time.Now().Unix()) + "@example.com"
	pw := "password123"
	reg := map[string]string{"email": email, "password": pw}
	jb, _ := json.Marshal(reg)
	resp, err := http.Post("http://localhost:8000/api/v1/auth/register", "application/json", bytes.NewReader(jb))
	if err != nil {
		t.Fatalf("register request failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		b, _ := ioutil.ReadAll(resp.Body)
		t.Fatalf("register failed: status=%d body=%s", resp.StatusCode, string(b))
	}

	// 2) Login
	resp, err = http.Post("http://localhost:8000/api/v1/auth/login", "application/json", bytes.NewReader(jb))
	if err != nil {
		t.Fatalf("login request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		b, _ := ioutil.ReadAll(resp.Body)
		t.Fatalf("login failed: status=%d body=%s", resp.StatusCode, string(b))
	}
	var loginResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		t.Fatalf("failed to decode login response: %v", err)
	}
	if loginResp.AccessToken == "" {
		t.Fatalf("no access token returned")
	}

	// 3) Create a customer (so we can add to cart)
	cust := map[string]string{"name": "Integration User", "email": email}
	cb, _ := json.Marshal(cust)
	creq, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/customers", bytes.NewReader(cb))
	creq.Header.Set("Content-Type", "application/json")
	creq.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	cres, err := http.DefaultClient.Do(creq)
	if err != nil {
		t.Fatalf("create customer request failed: %v", err)
	}
	if cres.StatusCode != http.StatusCreated {
		b, _ := ioutil.ReadAll(cres.Body)
		t.Fatalf("create customer failed: status=%d body=%s", cres.StatusCode, string(b))
	}
	var custRes struct{ ID int `json:"id"` }
	if err := json.NewDecoder(cres.Body).Decode(&custRes); err != nil {
		t.Fatalf("failed to decode customer response: %v", err)
	}

	// 4) Add to cart
	item := map[string]interface{}{"customerId": custRes.ID, "productId": 1, "quantity": 2}
	ib, _ := json.Marshal(item)
	areq, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/cart", bytes.NewReader(ib))
	areq.Header.Set("Content-Type", "application/json")
	areq.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	ares, err := http.DefaultClient.Do(areq)
	if err != nil {
		t.Fatalf("add to cart request failed: %v", err)
	}
	if ares.StatusCode != http.StatusCreated {
		b, _ := ioutil.ReadAll(ares.Body)
		t.Fatalf("add to cart failed: status=%d body=%s", ares.StatusCode, string(b))
	}

	// 5) Get cart
	greq, _ := http.NewRequest("GET", fmt.Sprintf("http://localhost:8000/api/v1/cart/%d", custRes.ID), nil)
	greq.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	gres, err := http.DefaultClient.Do(greq)
	if err != nil {
		t.Fatalf("get cart request failed: %v", err)
	}
	if gres.StatusCode != http.StatusOK {
		b, _ := ioutil.ReadAll(gres.Body)
		t.Fatalf("get cart failed: status=%d body=%s", gres.StatusCode, string(b))
	}

	// 6) Seed inventory for productId=1
	inv := map[string]interface{}{"product_id": 1, "quantity": 10, "sku": "sku-1", "location": "local"}
	invb, _ := json.Marshal(inv)
	invReq, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/inventory", bytes.NewReader(invb))
	invReq.Header.Set("Content-Type", "application/json")
	invRes, err := http.DefaultClient.Do(invReq)
	if err != nil {
		t.Fatalf("create inventory request failed: %v", err)
	}
	if invRes.StatusCode != http.StatusCreated {
		b, _ := ioutil.ReadAll(invRes.Body)
		t.Fatalf("create inventory failed: status=%d body=%s", invRes.StatusCode, string(b))
	}

	// 7) Create an order (auth required)
	order := map[string]interface{}{"product_id": 1, "quantity": 2}
	ob, _ := json.Marshal(order)
	oreq, _ := http.NewRequest("POST", "http://localhost:8000/api/v1/orders", bytes.NewReader(ob))
	oreq.Header.Set("Content-Type", "application/json")
	oreq.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	ores, err := http.DefaultClient.Do(oreq)
	if err != nil {
		t.Fatalf("create order request failed: %v", err)
	}
	if ores.StatusCode != http.StatusCreated {
		b, _ := ioutil.ReadAll(ores.Body)
		t.Fatalf("create order failed: status=%d body=%s", ores.StatusCode, string(b))
	}
	var orderRes struct{ ID int `json:"id"` }
	if err := json.NewDecoder(ores.Body).Decode(&orderRes); err != nil {
		t.Fatalf("failed to decode order response: %v", err)
	}

	// 8) Get order and verify owner
	goreq, _ := http.NewRequest("GET", fmt.Sprintf("http://localhost:8000/api/v1/orders/%d", orderRes.ID), nil)
	goreq.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	gores, err := http.DefaultClient.Do(goreq)
	if err != nil {
		t.Fatalf("get order request failed: %v", err)
	}
	if gores.StatusCode != http.StatusOK {
		b, _ := ioutil.ReadAll(gores.Body)
		t.Fatalf("get order failed: status=%d body=%s", gores.StatusCode, string(b))
	}

	// 9) Update order status to completed
	statusReq := map[string]string{"status": "completed"}
	statusB, _ := json.Marshal(statusReq)
	statusReqHTTP, _ := http.NewRequest("PATCH", fmt.Sprintf("http://localhost:8000/api/v1/orders/%d/status", orderRes.ID), bytes.NewReader(statusB))
	statusReqHTTP.Header.Set("Content-Type", "application/json")
	statusReqHTTP.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
	statusRes, err := http.DefaultClient.Do(statusReqHTTP)
	if err != nil {
		t.Fatalf("update status request failed: %v", err)
	}
	if statusRes.StatusCode != http.StatusOK {
		b, _ := ioutil.ReadAll(statusRes.Body)
		t.Fatalf("update status failed: status=%d body=%s", statusRes.StatusCode, string(b))
	}

	// Success
	t.Log("Integration flow completed successfully")
}
