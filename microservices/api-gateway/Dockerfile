FROM golang:1.24-alpine AS builder
WORKDIR /src

# Copy module files first to cache downloads
COPY go.mod go.sum ./
RUN go mod download

# Copy full repo then build the gateway
COPY . .
WORKDIR /src/api-gateway
RUN CGO_ENABLED=0 GOOS=linux go build -o /api-gateway .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /api-gateway .
EXPOSE 8000
CMD ["./api-gateway"]