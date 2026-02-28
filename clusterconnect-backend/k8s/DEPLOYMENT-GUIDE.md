# Kubernetes Deployment Guide for ClusterConnect

## Prerequisites
- Kubernetes cluster (minikube, EKS, GKE, or AKS)
- kubectl installed and configured
- Docker images pushed to registry

---

## Step 1: Build and Push Docker Images

### Backend
```bash
cd clusterconnect-backend
docker build -t <YOUR_REGISTRY>/clusterconnect-backend:latest .
docker push <YOUR_REGISTRY>/clusterconnect-backend:latest
```

### Frontend
```bash
cd ../Frontend/clusterconnect-client
docker build -t <YOUR_REGISTRY>/clusterconnect-frontend:latest .
docker push <YOUR_REGISTRY>/clusterconnect-frontend:latest
```

---

## Step 2: Update Image Names

Edit `k8s/backend.yaml` and `k8s/frontend.yaml`:
- Replace `<YOUR_DOCKER_REGISTRY>` with your actual registry
- Examples:
  - Docker Hub: `yourusername/clusterconnect-backend:latest`
  - AWS ECR: `123456789.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-backend:latest`
  - GCR: `gcr.io/your-project/clusterconnect-backend:latest`

---

## Step 3: Deploy to Kubernetes

### Apply configurations in order:

```bash
cd k8s

# 1. Create ConfigMap and Secrets
kubectl apply -f app-config.yaml
kubectl apply -f app-secrets.yaml

# 2. Deploy Zookeeper (Kafka dependency)
kubectl apply -f zookeeper.yaml

# 3. Wait for Zookeeper to be ready
kubectl wait --for=condition=ready pod -l app=zookeeper --timeout=120s

# 4. Deploy Kafka
kubectl apply -f kafka.yaml

# 5. Wait for Kafka to be ready
kubectl wait --for=condition=ready pod -l app=kafka --timeout=120s

# 6. Deploy Redis
kubectl apply -f redis.yaml

# 7. Deploy Backend
kubectl apply -f backend.yaml

# 8. Deploy Frontend
kubectl apply -f frontend.yaml
```

---

## Step 4: Verify Deployment

### Check all pods are running:
```bash
kubectl get pods
```

Expected output:
```
NAME                        READY   STATUS    RESTARTS   AGE
zookeeper-xxx               1/1     Running   0          2m
kafka-xxx                   1/1     Running   0          2m
redis-xxx                   1/1     Running   0          1m
backend-xxx                 1/1     Running   0          1m
backend-yyy                 1/1     Running   0          1m
frontend-xxx                1/1     Running   0          1m
frontend-yyy                1/1     Running   0          1m
```

### Check services:
```bash
kubectl get services
```

### Get external IPs:
```bash
kubectl get svc backend-service
kubectl get svc frontend-service
```

---

## Step 5: Access Your Application

### Get Frontend URL:
```bash
kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Access: `http://<EXTERNAL-IP>`

---

## Step 6: View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend

# Frontend logs
kubectl logs -f deployment/frontend

# Kafka logs
kubectl logs -f deployment/kafka

# Redis logs
kubectl logs -f deployment/redis
```

---

## Troubleshooting

### Pod not starting:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service not accessible:
```bash
kubectl get endpoints
kubectl describe svc <service-name>
```

### Database connection issues:
```bash
# Check secrets
kubectl get secret clusterconnect-secrets -o yaml

# Test from inside pod
kubectl exec -it <backend-pod> -- sh
curl http://backend-service:5000
```

---

## Scaling

### Scale backend:
```bash
kubectl scale deployment backend --replicas=5
```

### Scale frontend:
```bash
kubectl scale deployment frontend --replicas=3
```

---

## Update Deployment

### Update image:
```bash
kubectl set image deployment/backend backend=<YOUR_REGISTRY>/clusterconnect-backend:v2
```

### Rollback:
```bash
kubectl rollout undo deployment/backend
```

---

## Clean Up

### Delete all resources:
```bash
kubectl delete -f frontend.yaml
kubectl delete -f backend.yaml
kubectl delete -f redis.yaml
kubectl delete -f kafka.yaml
kubectl delete -f zookeeper.yaml
kubectl delete -f app-secrets.yaml
kubectl delete -f app-config.yaml
```

---

## Production Considerations

1. **Use Ingress Controller** instead of LoadBalancer
2. **Add Persistent Volumes** for Kafka and Redis
3. **Configure Resource Limits**:
   ```yaml
   resources:
     requests:
       memory: "256Mi"
       cpu: "250m"
     limits:
       memory: "512Mi"
       cpu: "500m"
   ```
4. **Add HorizontalPodAutoscaler**
5. **Use Secrets Manager** (AWS Secrets Manager, GCP Secret Manager)
6. **Configure Network Policies**
7. **Add Monitoring** (Prometheus, Grafana)
8. **Setup Logging** (ELK Stack, Loki)

---

## Minikube Local Testing

```bash
# Start minikube
minikube start

# Enable LoadBalancer
minikube tunnel

# Deploy
kubectl apply -f k8s/

# Access services
minikube service frontend-service
minikube service backend-service
```
