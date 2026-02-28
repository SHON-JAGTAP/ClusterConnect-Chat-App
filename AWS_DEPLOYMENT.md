# AWS EKS Deployment Guide for ClusterConnect

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- kubectl installed
- eksctl installed
- Docker Hub account (or AWS ECR)

---

## Step 1: Install Required Tools

### Install AWS CLI
```bash
# Linux/WSL
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

### Install eksctl
```bash
# Linux/WSL
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Verify
eksctl version
```

### Configure AWS CLI
```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
'''

---

## Step 2: Create RDS MySQL Database

### Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier clusterconnect-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --publicly-accessible \
  --storage-encrypted \
  --tags Key=Name,Value=ClusterConnect-DB
```

### Wait for RDS to be available
```bash
aws rds wait db-instance-available --db-instance-identifier clusterconnect-db
```

### Get RDS Endpoint
```bash
aws rds describe-db-instances \
  --db-instance-identifier clusterconnect-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

Save this endpoint (e.g., `clusterconnect-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Initialize Database
```bash
# Connect to RDS
mysql -h clusterconnect-db.xxxxx.us-east-1.rds.amazonaws.com -u admin -p

# Create database
CREATE DATABASE clusterconnect;
USE clusterconnect;

# Run your schema (from config/init.sql)
# Copy and paste the SQL from your init file
```

---

## Step 3: Create EKS Cluster

### Create Cluster with eksctl
```bash
eksctl create cluster \
  --name clusterconnect-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

This takes 15-20 minutes. ☕

### Verify Cluster
```bash
kubectl get nodes
kubectl get svc
```

---

## Step 4: Create ECR Repositories

### Create Repositories
```bash
# Backend repository
aws ecr create-repository \
  --repository-name clusterconnect-backend \
  --region us-east-1

# Frontend repository
aws ecr create-repository \
  --repository-name clusterconnect-frontend \
  --region us-east-1
```

### Get ECR Login
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

---

## Step 5: Build and Push Docker Images

### Build and Push Backend
```bash
cd clusterconnect-backend

# Build
docker build -t clusterconnect-backend:latest .

# Tag
docker tag clusterconnect-backend:latest \
  <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-backend:latest

# Push
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-backend:latest
```

### Build and Push Frontend
```bash
cd ../Frontend/clusterconnect-client

# Build
docker build -t clusterconnect-frontend:latest .

# Tag
docker tag clusterconnect-frontend:latest \
  <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-frontend:latest

# Push
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-frontend:latest
```

---

## Step 6: Update Kubernetes Manifests

### Update app-secrets.yaml
```yaml
stringData:
  DATABASE_URL: "mysql://admin:YourSecurePassword123!@clusterconnect-db.xxxxx.us-east-1.rds.amazonaws.com:3306/clusterconnect"
  JWT_SECRET: "your_production_secret_key_change_this"
  GOOGLE_CLIENT_ID: "your-google-client-id"
  GOOGLE_CLIENT_SECRET: "your-google-client-secret"
```

### Update backend.yaml
```yaml
image: <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-backend:latest
imagePullPolicy: Always
```

### Update frontend.yaml
```yaml
image: <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clusterconnect-frontend:latest
imagePullPolicy: Always
```

---

## Step 7: Deploy to EKS

### Apply Kubernetes Manifests
```bash
cd clusterconnect-backend/k8s

# Apply in order
kubectl apply -f app-config.yaml
kubectl apply -f app-secrets.yaml
kubectl apply -f zookeeper.yaml
sleep 30
kubectl apply -f kafka.yaml
sleep 30
kubectl apply -f redis.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
```

### Check Deployment
```bash
kubectl get pods
kubectl get svc
```

---

## Step 8: Access Your Application

### Get LoadBalancer URLs
```bash
# Frontend URL
kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Backend URL
kubectl get svc backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Access your app at: `http://<frontend-loadbalancer-url>`

---

## Step 9: Configure Domain (Optional)

### Using Route 53
```bash
# Create hosted zone
aws route53 create-hosted-zone --name clusterconnect.com --caller-reference $(date +%s)

# Create A record pointing to LoadBalancer
# Use AWS Console or CLI to create ALIAS record
```

---

## Step 10: Enable HTTPS with Certificate Manager

### Request Certificate
```bash
aws acm request-certificate \
  --domain-name clusterconnect.com \
  --subject-alternative-names www.clusterconnect.com \
  --validation-method DNS \
  --region us-east-1
```

### Install AWS Load Balancer Controller
```bash
# Install controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

# Create IAM policy and service account
# Follow: https://kubernetes-sigs.github.io/aws-load-balancer-controller/
```

### Update Services to use ALB
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "arn:aws:acm:us-east-1:xxx:certificate/xxx"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
```

---

## Monitoring & Logging

### CloudWatch Container Insights
```bash
# Enable Container Insights
aws eks update-cluster-config \
  --name clusterconnect-cluster \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'
```

### View Logs
```bash
# In AWS Console: CloudWatch > Log Groups > /aws/eks/clusterconnect-cluster
```

---

## Auto-Scaling

### Enable Cluster Autoscaler
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

### Configure HPA
```bash
kubectl autoscale deployment backend --min=2 --max=10 --cpu-percent=70
kubectl autoscale deployment frontend --min=2 --max=5 --cpu-percent=70
```

---

## Cost Optimization

### Estimated Monthly Costs
- EKS Cluster: $73/month
- EC2 Nodes (3x t3.medium): ~$100/month
- RDS (db.t3.micro): ~$15/month
- Load Balancers: ~$20/month
- **Total: ~$208/month**

### Cost Saving Tips
1. Use Spot Instances for worker nodes
2. Enable cluster autoscaler
3. Use RDS Reserved Instances
4. Delete unused resources

---

## Backup & Disaster Recovery

### RDS Automated Backups
```bash
# Already enabled with --backup-retention-period 7
```

### EKS Backup with Velero
```bash
# Install Velero
velero install --provider aws --bucket clusterconnect-backups --backup-location-config region=us-east-1

# Create backup
velero backup create clusterconnect-backup
```

---

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Database connection issues
```bash
# Check security group allows traffic from EKS nodes
# Verify RDS endpoint is correct
# Test connection from pod
kubectl exec -it <backend-pod> -- sh
mysql -h <rds-endpoint> -u admin -p
```

### LoadBalancer not getting external IP
```bash
# Check AWS Load Balancer Controller is installed
kubectl get pods -n kube-system | grep aws-load-balancer
```

---

## Cleanup (When Done Testing)

```bash
# Delete Kubernetes resources
kubectl delete -f k8s/

# Delete EKS cluster
eksctl delete cluster --name clusterconnect-cluster --region us-east-1

# Delete RDS
aws rds delete-db-instance \
  --db-instance-identifier clusterconnect-db \
  --skip-final-snapshot

# Delete ECR repositories
aws ecr delete-repository --repository-name clusterconnect-backend --force
aws ecr delete-repository --repository-name clusterconnect-frontend --force
```

---

## Next Steps

1. ✅ Setup CI/CD with GitHub Actions
2. ✅ Configure monitoring with Prometheus/Grafana
3. ✅ Add WAF for security
4. ✅ Enable CloudFront CDN
5. ✅ Setup alerting with SNS

---

## Support

For AWS-specific issues:
- AWS Support: https://console.aws.amazon.com/support
- EKS Documentation: https://docs.aws.amazon.com/eks

For application issues:
- GitHub Issues: https://github.com/yourusername/ClusterConnect/issues
