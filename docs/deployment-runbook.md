# Deployment Runbook - Expense Tracker

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Infrastructure Deployment (Terraform)](#infrastructure-deployment-terraform)
3. [Application Deployment (CI/CD)](#application-deployment-cicd)
4. [Accessing the Application](#accessing-the-application)
5. [Monitoring & Logs](#monitoring--logs)
6. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Prerequisites

### Required Tools
- ✅ AWS Account (Free Tier eligible)
- ✅ Terraform >= 1.0
- ✅ Docker Desktop
- ✅ Git
- ✅ AWS CLI configured with credentials
- ✅ Docker Hub account (username: iamharjeet)

### Required Secrets
- AWS Access Key ID & Secret Access Key (IAM user with appropriate permissions)
- Docker Hub username & token
- JWT Secret Key
- Database password

---

## Infrastructure Deployment (Terraform)

### Step 1: Clone Repository
```bash
git clone https://github.com/iamharjeet/expensetracker.git
cd expensetracker/terraform
```

### Step 2: Configure Variables
```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

**Required variables:**
- `aws_region` = "ca-central-1"
- `project_name` = "expensetracker"
- `environment` = "dev"
- `db_password` = "your-secure-password"
- `jwt_secret` = "your-jwt-secret-key"
- `s3_bucket_name` = "expensetracker-receipts-dev-harjeet2025"

### Step 3: Initialize Terraform
```bash
terraform init
```

### Step 4: Plan Infrastructure
```bash
terraform plan
```

Review the plan to see what resources will be created (VPC, RDS, S3, ECS, IAM, CloudWatch).

### Step 5: Apply Infrastructure
```bash
terraform apply
```

Type `yes` when prompted. This will create approximately 28 AWS resources.

**Deployment time:** ~10-15 minutes (RDS takes the longest)

### Step 6: Save Outputs
```bash
terraform output > outputs.txt
```

**Important outputs:**
- `rds_endpoint`: Database connection string
- `s3_bucket_name`: S3 bucket for receipts
- `ecs_cluster_name`: ECS cluster name
- `vpc_id`: VPC ID

---

## Application Deployment (CI/CD)

### Automated Deployment (Recommended)

The application automatically deploys when you push to the `main` branch.
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**GitHub Actions workflow will:**
1. Build Spring Boot application with Maven
2. Build Docker image
3. Push to Docker Hub (iamharjeet/expensetracker)
4. Deploy to ECS Fargate
5. Wait for service stability

**Deployment time:** ~7-12 minutes

### Manual Deployment (Alternative)

If CI/CD fails, you can manually deploy:

#### Step 1: Build Docker Image
```bash
cd expensetracker
docker build -t iamharjeet/expensetracker:manual .
```

#### Step 2: Push to Docker Hub
```bash
docker login
docker push iamharjeet/expensetracker:manual
```

#### Step 3: Update ECS Service
```bash
aws ecs update-service \
  --cluster expensetracker-dev-cluster \
  --service expensetracker-dev-service \
  --force-new-deployment \
  --region ca-central-1
```

---

## Accessing the Application

### Find Current Public IP

**Option 1: AWS Console**
1. Go to AWS ECS Console
2. Click on `expensetracker-dev-cluster`
3. Click on `expensetracker-dev-service`
4. Click on "Tasks" tab
5. Click on the running task
6. Find "Public IP" under "Network" section

**Option 2: AWS CLI**
```bash
aws ecs list-tasks --cluster expensetracker-dev-cluster --region ca-central-1
aws ecs describe-tasks --cluster expensetracker-dev-cluster --tasks <TASK_ARN> --region ca-central-1 | grep "publicIp"
```

### Access Application
```
http://<PUBLIC_IP>:8080
```

**Note:** Public IP changes with each deployment (no ALB to keep costs minimal).

### API Documentation (Swagger)
```
http://<PUBLIC_IP>:8080/swagger-ui.html
```

### Health Check
```
http://<PUBLIC_IP>:8080/actuator/health
```

---

## Monitoring & Logs

### CloudWatch Logs

**View Application Logs:**
1. Go to AWS CloudWatch Console
2. Navigate to "Log groups"
3. Click on `/ecs/expensetracker-dev`
4. View log streams for each ECS task

**Via AWS CLI:**
```bash
aws logs tail /ecs/expensetracker-dev --follow --region ca-central-1
```

### CloudWatch Alarms

**5 Active Alarms:**
1. `expensetracker-dev-ecs-cpu-high` - ECS CPU > 80%
2. `expensetracker-dev-ecs-memory-high` - ECS Memory > 80%
3. `expensetracker-dev-rds-cpu-high` - RDS CPU > 80%
4. `expensetracker-dev-rds-connections-high` - RDS connections > 80
5. `expensetracker-dev-rds-storage-low` - RDS storage < 10%

**View Alarms:**
```bash
aws cloudwatch describe-alarms --region ca-central-1
```

### CloudWatch Dashboard

Access dashboard: `expensetracker-dev-dashboard`
- ECS CPU & Memory metrics
- RDS CPU, connections, storage
- Visual monitoring of all key metrics

---

## Common Issues & Troubleshooting

### Issue 1: ECS Task Not Starting

**Symptoms:** Task keeps restarting, shows "STOPPED" status

**Possible Causes:**
- Database connection failure
- Missing environment variables
- Docker image pull failure

**Solution:**
```bash
# Check task logs in CloudWatch
aws logs tail /ecs/expensetracker-dev --follow --region ca-central-1

# Common fixes:
# 1. Verify RDS is running
aws rds describe-db-instances --region ca-central-1

# 2. Check security group rules allow ECS → RDS on port 5432
# 3. Verify DATABASE_URL environment variable in ECS task definition
```

---

### Issue 2: Cannot Connect to Database

**Symptoms:** Application logs show `Connection refused` or timeout errors

**Possible Causes:**
- RDS security group blocking ECS tasks
- Wrong database endpoint
- Database not fully initialized

**Solution:**
```bash
# Verify RDS endpoint
terraform output rds_endpoint

# Check security groups
# RDS security group must allow inbound from ECS security group on port 5432

# Test connectivity from ECS task
aws ecs execute-command \
  --cluster expensetracker-dev-cluster \
  --task <TASK_ID> \
  --container expensetracker-container \
  --interactive \
  --command "/bin/sh"

# Inside container:
nc -zv <RDS_ENDPOINT> 5432
```

---

### Issue 3: S3 Access Denied Errors

**Symptoms:** Receipt upload fails with `Access Denied` error

**Possible Causes:**
- ECS task role missing S3 permissions
- Wrong S3 bucket name
- Bucket doesn't exist

**Solution:**
```bash
# Verify S3 bucket exists
aws s3 ls s3://expensetracker-receipts-dev-harjeet2025 --region ca-central-1

# Check ECS task role has S3 permissions
aws iam get-role-policy \
  --role-name expensetracker-dev-ecs-task-role \
  --policy-name expensetracker-dev-s3-access

# Verify bucket name in task definition environment variables
```

---

### Issue 4: GitHub Actions Deployment Fails

**Symptoms:** CI/CD pipeline fails at "Deploy to ECS" step

**Possible Causes:**
- Missing GitHub secrets
- Wrong ECS cluster/service names
- AWS credentials expired

**Solution:**
```bash
# Verify GitHub Secrets are set:
# - DOCKERHUB_USERNAME
# - DOCKERHUB_TOKEN
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION
# - ECS_CLUSTER_NAME
# - ECS_SERVICE_NAME

# Check workflow logs in GitHub Actions tab

# Manually trigger deployment if needed (see Manual Deployment section)
```

---

## Rollback Procedure

### Option 1: Redeploy Previous Docker Image
```bash
# Find previous commit SHA from GitHub
git log --oneline -10

# Update ECS task definition to use previous image
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ca-central-1

# Update service
aws ecs update-service \
  --cluster expensetracker-dev-cluster \
  --service expensetracker-dev-service \
  --task-definition expensetracker-dev:<REVISION> \
  --region ca-central-1
```

### Option 2: Revert Git Commit & Redeploy
```bash
git revert <COMMIT_SHA>
git push origin main
# CI/CD will automatically deploy the reverted version
```

---

## Database Migrations

**Flyway** handles all database migrations automatically on application startup.

**Migration files location:** `src/main/resources/db/migration/`

**View migration history:**
```sql
-- Connect to RDS using psql
psql -h expensetracker-dev-db.cnaayeogwvw9.ca-central-1.rds.amazonaws.com -U postgres -d expense_tracker_db

-- Query migration history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

---

## Cost Optimization

**Current AWS costs (Free Tier):**
- ✅ ECS Fargate: Free for 12 months (limited hours)
- ✅ RDS db.t3.micro: Free for 12 months (750 hours/month)
- ✅ S3: Free for 12 months (5GB storage)
- ✅ CloudWatch: Free tier (10 custom metrics, 10 alarms)

**After Free Tier expires:** ~$19-20/month

**To minimize costs:**
- Stop ECS service when not in use: `aws ecs update-service --desired-count 0`
- Use RDS snapshots and delete instance when not needed
- Delete old S3 objects (lifecycle policy already configured: 90 days)

---

## Support & Resources

- **GitHub Repository:** https://github.com/iamharjeet/expensetracker
- **API Documentation:** http://<PUBLIC_IP>:8080/swagger-ui.html
- **Architecture Diagrams:** `docs/architecture/`
- **AWS Region:** ca-central-1 (Canada - Montreal)

---

**Last Updated:** November 2025