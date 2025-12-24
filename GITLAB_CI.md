# GitLab CI/CD Setup Guide

This document explains how to configure and use the GitLab CI/CD pipeline for the microservices platform.

## Pipeline Overview

The CI/CD pipeline consists of 4 stages:

1. **Test** - Run unit tests and linting
2. **Security** - Security vulnerability scanning
3. **Build** - Build and push Docker images
4. **Deploy** - Deploy to staging/production

## Pipeline Stages

### 1. Test Stage

**Backend Tests:**
- Runs Go unit tests with coverage
- Uses PostgreSQL, Redis, and RabbitMQ services
- Generates coverage reports
- Coverage threshold: Shows coverage percentage

**Frontend Tests:**
- Runs ESLint for code quality
- TypeScript type checking
- Caches node_modules for faster builds

### 2. Security Stage

**Trivy:**
- Scans for vulnerabilities in dependencies
- Checks HIGH and CRITICAL severity issues
- Scans both backend and frontend code

**gosec:**
- Static analysis for Go code
- Identifies security issues in Go code
- Generates JSON report

**npm audit:**
- Checks npm dependencies for vulnerabilities
- Reports HIGH severity issues

### 3. Build Stage

Builds Docker images for:
- API Gateway
- Auth Service
- Product Service
- Order Service
- Frontend Client
- Nginx Proxy

Each image is tagged with:
- Commit SHA (e.g., `abc1234`)
- `latest` tag

### 4. Deploy Stage

**Staging:**
- Auto-deploy to staging on `develop` branch
- Manual trigger required
- Uses Kubernetes

**Production:**
- Deploy to production on `main` branch
- Manual trigger required
- Requires staging deployment first
- Includes rollback capability

## Setup Instructions

### 1. Configure GitLab CI/CD Variables

Go to **Settings → CI/CD → Variables** and add:

#### Container Registry (Auto-configured)
- `CI_REGISTRY` - GitLab container registry URL
- `CI_REGISTRY_USER` - Registry username
- `CI_REGISTRY_PASSWORD` - Registry password

#### Kubernetes Configuration
```bash
# For Staging
KUBE_CONFIG_STAGING=<base64-encoded-kubeconfig>

# For Production
KUBE_CONFIG_PROD=<base64-encoded-kubeconfig>
```

To encode kubeconfig:
```bash
cat ~/.kube/config | base64 -w 0
```

#### Optional Variables
- `JWT_SECRET` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe API key

### 2. Enable Container Registry

1. Go to **Settings → General → Visibility**
2. Enable **Container Registry**
3. Save changes

### 3. Configure Kubernetes

Create namespace:
```bash
kubectl create namespace microservices
```

Create necessary secrets:
```bash
# Docker registry credentials
kubectl create secret docker-registry gitlab-registry \
  --docker-server=$CI_REGISTRY \
  --docker-username=$CI_REGISTRY_USER \
  --docker-password=$CI_REGISTRY_PASSWORD \
  --namespace=microservices

# Application secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=stripe-key=your-stripe-key \
  --namespace=microservices
```

### 4. Create Kubernetes Deployments

Example deployment for API Gateway:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: microservices
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      imagePullSecrets:
        - name: gitlab-registry
      containers:
      - name: api-gateway
        image: registry.gitlab.com/your-group/your-project/api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
```

## Usage

### Trigger Pipeline

**Automatic Triggers:**
- Push to `main` → Full pipeline
- Push to `develop` → Full pipeline  
- Create MR → Test + Security stages only

**Manual Triggers:**
- Go to **CI/CD → Pipelines**
- Click **Run Pipeline**
- Select branch
- Click **Run**

### Deploy to Staging

1. Merge to `develop` branch
2. Pipeline runs automatically
3. Wait for build stage to complete
4. Go to deploy stage
5. Click **Play** button on `deploy:staging`
6. Confirm deployment

### Deploy to Production

1. Merge to `main` branch
2. Pipeline runs automatically
3. Wait for all tests and builds
4. Click **Play** on `deploy:production`
5. Confirm deployment

### Rollback Production

If something goes wrong:
1. Go to latest pipeline
2. Find `rollback:production` job
3. Click **Play** button
4. Kubernetes will rollback to previous version

## Monitoring Pipeline

### View Pipeline Status

**Pipeline Overview:**
- Go to **CI/CD → Pipelines**
- See all pipeline runs
- Status: Passed ✓, Failed ✗, Running ⚙

**Job Details:**
- Click on pipeline
- View individual jobs
- See logs and artifacts

### Download Artifacts

Available artifacts:
- Test coverage reports (HTML)
- Security scan reports (JSON)
- Build logs

To download:
1. Go to pipeline
2. Click on job
3. Right sidebar → **Job artifacts**
4. Click **Download**

## Best Practices

### Branching Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

**Workflow:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Create Merge Request to `develop`
4. Pipeline runs tests
5. After approval, merge to `develop`
6. Deploy to staging
7. Test on staging
8. Create MR from `develop` to `main`
9. Deploy to production

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add user authentication
fix: Fix order processing bug
docs: Update API documentation
test: Add integration tests
chore: Update dependencies
```

### Merge Request Guidelines

1. **Description:** Clear description of changes
2. **Tests:** Ensure tests pass
3. **Security:** Check security scan results
4. **Review:** Get code review approval
5. **Conflicts:** Resolve merge conflicts

## Troubleshooting

### Pipeline Fails on Test Stage

**Common Issues:**
- Dependencies missing
- Database connection failed
- Test data issues

**Solution:**
```bash
# Run tests locally
cd microservices/order-service
go test -v ./...

# Check service configuration
docker-compose up postgres redis rabbitmq
```

### Build Stage Fails

**Common Issues:**
- Dockerfile errors
- Missing files
- Registry authentication

**Solution:**
```bash
# Test Docker build locally
cd microservices
docker build -f api-gateway/Dockerfile .

# Check registry access
docker login $CI_REGISTRY
```

### Deploy Stage Fails

**Common Issues:**
- Kubernetes credentials expired
- Namespace not found
- Image pull errors

**Solution:**
```bash
# Verify kubectl access
kubectl get pods -n microservices

# Check image exists
docker pull $CI_REGISTRY_IMAGE/api-gateway:latest

# Verify secrets
kubectl get secrets -n microservices
```

### Security Scan Warnings

**High severity vulnerabilities:**
- Update dependencies
- Review gosec warnings
- Fix identified issues

```bash
# Update Go dependencies
go get -u ./...
go mod tidy

# Update npm dependencies
npm audit fix
```

## Pipeline Optimization

### Cache Configuration

Node modules are cached per branch:
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - client/node_modules/
```

### Parallel Jobs

Jobs run in parallel within stages for faster pipelines:
- All build jobs run simultaneously
- All security scans run simultaneously

### Artifacts Retention

- Test coverage: 30 days
- Security reports: 30 days
- Build artifacts: 1 day

## Advanced Configuration

### Custom Runners

For faster builds, configure custom GitLab runners:

```bash
# Install GitLab Runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

# Register runner
sudo gitlab-runner register
```

### Pipeline Schedules

Set up scheduled pipelines:
1. Go to **CI/CD → Schedules**
2. Click **New schedule**
3. Set cron expression (e.g., daily at 2 AM)
4. Select branch
5. Save

### Environment-Specific Variables

Configure per environment:
1. Go to **Settings → CI/CD → Variables**
2. Add variable
3. Select environment (staging/production)
4. Add value

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
