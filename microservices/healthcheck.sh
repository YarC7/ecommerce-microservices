#!/bin/bash

# Health Check Monitoring Script for Docker Services
# Displays the health status of all services in docker-compose

echo "========================================="
echo "Docker Services Health Check"
echo "========================================="
echo ""

# Get all service names and their health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}" | while IFS= read -r line; do
    if [[ $line == *"healthy"* ]]; then
        echo "✅ $line"
    elif [[ $line == *"unhealthy"* ]]; then
        echo "❌ $line"
    elif [[ $line == *"starting"* ]]; then
        echo "⏳ $line"
    elif [[ $line == "NAME"* ]]; then
        echo "$line"
    else
        echo "⚪ $line"
    fi
done

echo ""
echo "========================================="

# Count healthy vs unhealthy
HEALTHY=$(docker-compose ps | grep -c "healthy")
UNHEALTHY=$(docker-compose ps | grep -c "unhealthy")

echo "Healthy: $HEALTHY | Unhealthy: $UNHEALTHY"
echo "========================================="
