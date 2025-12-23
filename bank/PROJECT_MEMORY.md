# Project Memory — Go Microservices (Go-Microservices)

_Last updated: 2025-12-23_

This document is the canonical memory and orientation file for the Go-Microservices project. It is written for humans and automated agents (CI, bots) to quickly understand the codebase, design decisions, auth behavior, test harnesses, and operational commands.

---

## 🎯 Purpose

- Provide a compact but comprehensive summary of the project structure, responsibilities, critical flows (auth, payments, orders), and operational/testing pointers.
- Serve as a starting point / index for any agent or contributor onboarding to work on features, debugging, or automated maintenance.

---

## 🔧 High-level Architecture

- Language: Go (Gin framework) for microservices.
- Frontend: Next.js (App Router) under `client/`.
- Databases: PostgreSQL per service, plus a separate `auth-db` for users & sessions.
- Queue: RabbitMQ for async events.
- Cache: Redis (used by some services, e.g., order worker/cache).
- Local orchestration: `docker-compose.yml` for multi-service runs.

---

## 📁 Key Services (folders)

- `auth-service/` — central auth: register/login/refresh/logout/revoke/list-sessions. Stores user and session data.
- `api-gateway/` — entry point, validates JWTs and sets `X-User-Id` / `X-User-Roles` headers for downstream services.
- `order-service/`, `payment-service/`, `cart-service/`, `product-service/`, etc. — domain services implementing business logic with ownership checks.
- `client/` — Next.js app implementing App Router server routes for auth and a server-side proxy to forward requests with httpOnly cookies.

---

## 🔐 Auth & Security

- Access Token: JWT HS256, short-lived (e.g., 15m). Signed using `JWT_SECRET`.
- Refresh Token: Random token, long-lived (e.g., 7d), stored _hashed_ in `sessions` table; rotated on refresh (refresh token rotation) and revocable.
- Sessions: Stored in the `auth-db` with hashed refresh tokens, device info, IP, expiration.
- Logout & Revoke: Refresh tokens can be revoked (DELETE session); login returns access + refresh tokens.
- Gateway enforcement: API Gateway validates JWT and forwards user info via headers: `X-User-Id`, `X-User-Roles`.
- Frontend cookie handling: Server routes set httpOnly `access_token` and `refresh_token`, and a non-httpOnly `user` cookie for client UI display.

---

## 🔁 Token Flow (Summary)

1. Client POST `/api/auth/login` → server sets httpOnly `access_token` + `refresh_token` and returns user information.
2. Client includes `access_token` (via proxy) → API Gateway verifies JWT and forwards headers.
3. On 401 from internal services, server proxy attempts POST `/api/auth/refresh` (using server-side `refresh_token`) to rotate refresh token and retry the original request.
4. Logout/Revocation invalidates refresh token in DB.

---

## 📚 Important Files & Locations

- Auth service: `auth-service/controller/auth_controller.go`, `auth-service/model/*`, `auth-service/db/*`
- Gateway JWT helpers: `api-gateway/auth.go`
- Frontend App Router routes:
  - `client/app/api/auth/login/route.ts`
  - `client/app/api/auth/refresh/route.ts`
  - `client/app/api/auth/logout/route.ts`
  - `client/app/api/proxy/route.ts` (server-side proxy for forwarding requests)
- Client helpers: `client/lib/api.ts`, `client/server/lib/serverProxy.ts`
- Tests:
  - Unit tests: Go (`*_test.go`), client (`client/tests/` using Vitest)
  - Integration: `tests/integration/integration_test.go` (Docker Compose driven)
- CI: `.github/workflows/integration.yml` (integration test workflow)

---

## ✅ Testing & CI

- Unit tests use Go testing + `sqlmock` for DB-level tests.
- Frontend unit tests use Vitest in `client/`.
- Integration tests run a `docker-compose` environment and exercise register→login→create customer→add-to-cart→create-order→create-payment→confirm-payment flow.
- The integration job is gated by env variable e.g., `RUN_INTEGRATION_TESTS=true` to avoid running expensive tests unintentionally.

---

## ⚙️ Local Dev / Run

- Environment variables: check `.env` examples for `JWT_SECRET`, DB URLs, RABBITMQ, REDIS, STRIPE keys (optional stubbed mode when absent).
- Start locally (development):
  - `docker-compose up --build` — starts services and DBs
  - Or run services individually with `go run .` from each service folder with appropriate env vars.
- Client: `cd client` → `pnpm install` → `pnpm dev` (or `pnpm build` / `pnpm start`).

---

## 💡 Agent Guidance / How to use this memory file

- Use this file as the first reference for architecture and auth rules. If making edits that change auth flows, update this file to keep memory consistent.
- Before proposing CI or test changes, run unit tests locally and then the integration suite.
- When modifying App Router server routes, ensure `cookies()` is awaited and `cookieStore` is used (Next 13+ cookie API returns a Promise).
- When adding new services, register their Docker Compose service and appropriate DB container and add healthchecks.

---

## 📌 Current State Snapshot (summary)

- Auth implemented (register/login/refresh/logout/revoke), session rotation in place.
- Gateway JWT validation + role headers present; critical routes protected (orders, payments, cart).
- Frontend proxy, auth server routes, and AutoRefreshClient implemented.
- Integration tests exist but may require `RUN_INTEGRATION_TESTS=true` and Docker available to run.

---

## 🧭 Next Recommended Improvements (short list)

- Add more negative-path tests for token rotation edge cases and concurrent refresh scenarios.
- Add an observability metric (Prometheus) for auth events: failed login, revoked sessions, refresh failures.
- Add automated updating workflow if this file is changed (e.g., validate presence & last-updated via CI lint step).

---

## ❓ Questions / Notes for maintainers

- Ensure `JWT_SECRET` is rotated carefully across environments; sessions in DB may need invalidation after rotation.
- Consider supporting asymmetric JWTs (RS256) for improved key rotation strategies in future.

---

If you'd like, I can split this memory into multiple files (architecture.md, auth.md, testing.md) or add links to the most important source files. Want me to commit this to `main` branch or open a PR?

_End of file._
