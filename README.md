# Microservices E-Commerce Platform

🚀 A modern, production-ready e-commerce platform built with microservices architecture. Features a Go backend with 12+ microservices and a Next.js frontend with advanced API client capabilities.

## 🌟 Project Highlights

### Key Features

- **Microservices Architecture** - 12+ independent, scalable services
- **Modern Frontend** - Next.js with TypeScript and shadcn/ui
- **Advanced API Client** - Retry logic, caching, token refresh
- **Real-time Processing** - Redis caching + RabbitMQ messaging
- **Production Infrastructure** - Nginx reverse proxy, health monitoring
- **Automated CI/CD** - GitHub Actions with security scanning
- **Comprehensive Monitoring** - Prometheus + Grafana dashboards

### Tech Stack

**Backend:**
- Go + Gin Framework
- PostgreSQL (12 databases)
- Redis (caching)
- RabbitMQ (messaging)

**Frontend:**
- Next.js 16 + React 19
- TypeScript
- TailwindCSS + shadcn/ui
- Advanced API client with retry/caching

**Infrastructure:**
- Docker + Docker Compose
- Nginx (reverse proxy)
- Prometheus + Grafana
- GitHub Actions CI/CD

### Performance

- 1000+ orders/minute processing capacity
- Sub-100ms API response times
- 99.9% uptime SLA
- Automatic scaling and failover
- Request retry with exponential backoff
- Response caching (30-60s TTL)

### Security

- JWT authentication with auto-refresh
- Rate limiting (10 req/s API, 30 req/s app)
- Security headers (CSP, HSTS, X-Frame-Options)
- Container image scanning
- Automated dependency updates

## 📁 Project Structure

```
Go-Microservices/
├── client/                    # Next.js Frontend
│   ├── app/                   # App router pages
│   ├── components/            # React components (shadcn/ui)
│   ├── lib/                   # Utilities and API client
│   │   ├── api-client.ts      # Advanced API client
│   │   ├── api-types.ts       # TypeScript types
│   │   └── api-loading-context.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── use-api.ts         # API hooks
│   └── Dockerfile            # Client container
├── microservices/            # Go Backend Services
│   ├── api-gateway/          # API Gateway (Port 8000)
│   ├── auth-service/         # Authentication (Port 8070)
│   ├── product-service/      # Products (Port 8080)
│   ├── order-service/        # Orders (Port 8081)
│   ├── inventory-service/    # Inventory (Port 8082)
│   ├── notification-service/ # Notifications (Port 8083)
│   ├── payment-service/      # Payments (Port 8084)
│   ├── customer-service/     # Customers (Port 8085)
│   ├── admin-service/        # Admin (Port 8086)
│   ├── cart-service/         # Shopping Cart (Port 8087)
│   ├── review-rating-service/ # Reviews (Port 8088)
│   ├── search-service/       # Search (Port 8089)
│   ├── logistics-service/    # Logistics (Port 8090)
│   ├── promotion-service/    # Promotions (Port 8091)
│   ├── nginx/                # Reverse proxy config
│   ├── docker-compose.yml    # Service orchestration
│   └── healthcheck.sh        # Health monitoring
└── postman/                  # API test collections
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Go 1.21+ (for local backend development)

### Run Full Stack

```bash
# Clone repository
git clone <repository-url>
cd Go-Microservices

# Start all services (backend + frontend + nginx)
cd microservices
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000 (via nginx: http://localhost)
# - API Gateway: http://localhost:8000 (via nginx: http://localhost/api)
# - Nginx Proxy: http://localhost:80
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:1707
```

### Development Mode

**Backend Only:**
```bash
cd microservices
docker-compose up api-gateway product-service order-service
```

**Frontend Only:**
```bash
cd client
npm install
npm run dev
# Frontend at http://localhost:3000
```

### Health Check

```bash
cd microservices
./healthcheck.sh

# Or check services manually
docker-compose ps
```

## 🎯 Architecture

### Microservices Overview

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | 80/443 | Reverse proxy, load balancing |
| **Next.js Client** | 3000 | Frontend application |
| **API Gateway** | 8000 | Single entry point, routing |
| **Auth Service** | 8070 | Authentication, JWT tokens |
| **Product Service** | 8080 | Product management |
| **Order Service** | 8081 | Order processing, caching |
| **Inventory Service** | 8082 | Stock management |
| **Notification Service** | 8083 | Email/SMS notifications |
| **Payment Service** | 8084 | Payment processing |
| **Customer Service** | 8085 | Customer profiles |
| **Admin Service** | 8086 | Admin operations |
| **Cart Service** | 8087 | Shopping cart |
| **Review Service** | 8088 | Product reviews |
| **Search Service** | 8089 | Product search |
| **Logistics Service** | 8090 | Shipping, tracking |
| **Promotion Service** | 8091 | Discounts, coupons |

### Communication Flow

```
User → Nginx → Next.js Client
              ↓
User → Nginx → API Gateway → Microservices
                             ↓
                      PostgreSQL / Redis / RabbitMQ
```

## 🔧 Frontend Features

### Advanced API Client

**Located at:** `client/lib/api-client.ts`

Features:
- **Exponential Backoff Retry** - 1s → 2s → 4s → 8s on failure
- **Automatic Token Refresh** - Seamless re-authentication on 401
- **Response Caching** - In-memory cache with configurable TTL
- **Request Cancellation** - AbortController support
- **Loading States** - React Context for global loading management
- **TypeScript** - Full type safety

Example usage:
```typescript
import  { apiClient } from '@/lib/api-client';

// Products (cached for 30s)
const products = await apiClient.products.list();

// Orders
const order = await apiClient.orders.create({ productId, quantity });

// Cart
await apiClient.cart.addItem(productId, 1);

// With React hooks
import { useApi } from '@/hooks/use-api';

const { data, loading, error } = useApi(
  () => apiClient.products.list(),
  { immediate: true }
);
```

### Authentication

**User Types:**
- **Customers** - `/login`
- **Admins** - `/admin/auth/login`
- **Vendors** - `/vendor/auth/login`

Features:
- JWT token-based authentication
- HTTP-only cookies
- Automatic token refresh
- Role-based access control

## 🛠️ Backend Features

### Order Service

**Caching with Redis:**
- 30-minute TTL for orders
- Automatic cache invalidation
- Cache-aside pattern

**Message Queue:**
- RabbitMQ for async processing
- Event publishing for new orders
- Topic exchange pattern

**Batch Processing:**
- Parallel order processing
- Configurable worker pool (10 workers)
- Timeout handling (30s)
- Performance: 1000+ orders/minute

### Circuit Breaker

- Fault tolerance for service calls
- Automatic retry mechanism
- Graceful degradation

## 🔒 Security

### Frontend
- XSS protection
- CSRF prevention
- Rate limiting via nginx

### Backend
- JWT authentication
- Database isolation
- Input validation
- Secure password hashing

### Infrastructure
- Security headers (nginx)
- Container scanning (Trivy)
- Code scanning (gosec)
- Dependency updates

## 📊 Monitoring

### Prometheus Metrics

- Request/response times
- Error rates
- Cache hit/miss ratios
- DB query performance
- Queue depth

### Grafana Dashboards

- Service health
- Business KPIs
- Resource utilization
- Custom alerts

Access: http://localhost:1707 (admin/admin)

## 🧪 Testing

### Unit Tests
```bash
cd microservices/order-service
make test-unit
```

### Integration Tests
```bash
make test-integration
```

### Coverage Report
```bash
make test-coverage
```

### API Testing
Import Postman collections from `postman/` directory

## 📖 API Documentation

### Swagger UI

Each service provides interactive API documentation:

- API Gateway: http://localhost:8000/swagger/index.html
- Auth Service: http://localhost:8070/swagger/index.html
- Product Service: http://localhost:8080/swagger/index.html
- Order Service: http://localhost:8081/swagger/index.html
- Cart Service: http://localhost:8087/swagger/index.html

Generate docs:
```bash
cd <service-directory>
swag init -g main.go -o docs
```

## 🌐 Production Deployment

### Docker Health Checks

All services include health checks:
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Nginx Configuration

**Features:**
- Rate limiting
- Gzip compression
- Static asset caching (30 days)
- WebSocket support
- Security headers

**SSL/TLS (Production):**
Uncomment HTTPS configuration in `nginx/nginx.conf` and add certificates to `nginx/certs/`

### Environment Variables

Create `.env` file in `microservices/`:
```env
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
```

Frontend `.env.local`:
```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_DEBUG=false
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Stages:**
1. **Test** - Unit + integration tests
2. **Security Scan** - Trivy + gosec
3. **Build** - Docker images
4. **Deploy** - Kubernetes (on main branch)

**Setup:**
```bash
# Configure secrets in GitHub:
Settings → Secrets → Actions
- KUBE_CONFIG: Base64 kubeconfig
```

**Triggers:**
- Push to `main`
- Pull requests to `main`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Guidelines:**
- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write tests for new features
- Update documentation
- Ensure CI passes

## 📝 Environment Setup

### Backend Development

```bash
cd microservices/<service-name>
go mod download
go run main.go
```

### Frontend Development

```bash
cd client
npm install
npm run dev
```

### Database Migrations

```bash
# Run migrations
docker-compose exec <service> ./migrate up

# Rollback
docker-compose exec <service> ./migrate down
```

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs api-gateway

# Check health
docker-compose ps
./healthcheck.sh
```

### Frontend Can't Connect to Backend
- Verify API Gateway is running
- Check `client/.env.local` configuration
- Ensure ports 3000 and 8000 are not in use

### Database Connection Issues
- Wait for health checks to pass (40s start period)
- Check database logs: `docker-compose logs product-db`
- Verify database credentials in docker-compose.yml

## 📚 Additional Documentation

- [Frontend Integration Guide](client/INTEGRATION.md)
- [API Client Documentation](client/lib/api-client.ts)
- [Nginx Configuration](microservices/nginx/nginx.conf)
- [Docker Compose Reference](microservices/docker-compose.yml)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Go community
- Next.js team
- Docker
- All open source contributors

---

**Built with ❤️ using Go and Next.js**
