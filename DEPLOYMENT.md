# ClusterConnect Deployment Guide

## Project Overview
Cloud-native real-time chat application with Kubernetes deployment.

## Architecture
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MySQL (or managed service in production)
- **Message Queue**: Kafka
- **Cache**: Redis
- **Orchestration**: Kubernetes

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- kubectl (for K8s)
- minikube (for local K8s)

### Run Locally
```bash
# Start infrastructure
docker compose up -d

# Start backend
cd clusterconnect-backend
npm install
npm start

# Start frontend
cd ../Frontend/clusterconnect-client
npm install
npm run dev
```

Access: http://localhost:5173

---

## Kubernetes Deployment

### Local (Minikube)
```bash
# Start minikube
minikube start

# Build images
eval $(minikube docker-env)
docker build -t clusterconnect-backend:latest ./clusterconnect-backend
docker build -t clusterconnect-frontend:latest ./Frontend/clusterconnect-client

# Deploy
cd clusterconnect-backend/k8s
kubectl apply -f app-config.yaml
kubectl apply -f app-secrets.yaml
kubectl apply -f zookeeper.yaml
kubectl apply -f kafka.yaml
kubectl apply -f redis.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

# Access
minikube service frontend-service
```

### Production (AWS EKS)
See AWS_DEPLOYMENT.md

### Production (GCP GKE)
See GCP_DEPLOYMENT.md

---

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your_secret
KAFKA_BROKER=localhost:9092
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Kubernetes (app-secrets.yaml)
```yaml
DATABASE_URL: mysql://user:pass@rds-endpoint:3306/db
JWT_SECRET: production_secret
```

---

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify Kafka and Redis are running
- Check logs: `kubectl logs -l app=backend`

### Frontend can't connect
- Verify backend service is running
- Check VITE_API_URL environment variable
- Ensure CORS is configured

### Database connection fails
- Check credentials
- Verify network connectivity
- For K8s: ensure service DNS is working

---

## Monitoring

### Check Pod Status
```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services
```bash
kubectl get svc
kubectl describe svc <service-name>
```

---

## Scaling

### Scale Backend
```bash
kubectl scale deployment backend --replicas=5
```

### Scale Frontend
```bash
kubectl scale deployment frontend --replicas=3
```

---

## Backup & Recovery

### Database Backup
```bash
# For MySQL in K8s
kubectl exec -it <mysql-pod> -- mysqldump -u root -p clusterconnect > backup.sql

# For RDS
aws rds create-db-snapshot --db-instance-identifier clusterconnect-db
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Enable SSL/TLS
- [ ] Configure network policies
- [ ] Set resource limits
- [ ] Enable pod security policies
- [ ] Regular security updates

---

## Performance Optimization

- [ ] Enable Redis caching
- [ ] Configure Kafka partitions
- [ ] Add CDN for frontend
- [ ] Enable gzip compression
- [ ] Optimize database queries
- [ ] Add connection pooling

---

## CI/CD Pipeline

See `.github/workflows/deploy.yml` for automated deployment.

---

## Support

For issues, contact: your-email@example.com
