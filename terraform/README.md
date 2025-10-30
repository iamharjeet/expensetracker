# Expense Tracker - Terraform Infrastructure

This directory contains Terraform configurations for deploying the Expense Tracker infrastructure on AWS.

## Architecture Overview

The infrastructure includes:
- **VPC** with public subnets across 2 availability zones
- **RDS PostgreSQL** database (single-AZ, free tier eligible, secured by security group)
- **S3 bucket** for receipt storage with encryption
- **IAM roles** for ECS task execution and application permissions
- **Security groups** for ALB, ECS tasks, and RDS (network isolation)
- **CloudWatch log groups** for application and system logs

**Note**: RDS is deployed in public subnets but remains secure through security group rules that only allow access from ECS tasks. This simplified approach reduces complexity while maintaining security.

## Prerequisites

1. **Install Terraform** (version >= 1.0)
   ```bash
   # macOS
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform

   # Windows (with Chocolatey)
   choco install terraform

   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **AWS CLI configured** with appropriate credentials
   ```bash
   aws configure
   # Region: ca-central-1 (Canada - Montreal)
   ```

3. **Terraform variables file**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your actual values
   ```

## File Structure

```
terraform/
├── main.tf                 # Provider configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── vpc.tf                  # VPC, public subnets, routing
├── security-groups.tf      # Security groups
├── rds.tf                  # PostgreSQL database
├── s3.tf                   # S3 bucket for receipts
├── iam.tf                  # IAM roles and policies
├── cloudwatch.tf           # CloudWatch log groups
├── terraform.tfvars.example # Template for variables
├── .gitignore              # Git ignore patterns
└── README.md               # This file
```

## Configuration

### Required Variables

Edit `terraform.tfvars` and set the following:

1. **Database Password** (`db_password`)
   - Generate a secure password: `openssl rand -base64 32`
   - Or use a simple password for dev: `expensetracker123`
   - Store securely (don't commit to Git!)

2. **JWT Secret** (`jwt_secret`)
   - Generate a secure secret: `openssl rand -base64 64`
   - Or use a simple secret for dev: `my-jwt-secret-key-for-expense-tracker`
   - Store securely (don't commit to Git!)

3. **S3 Bucket Name** (`receipts_bucket_name`)
   - Must be globally unique across all AWS accounts
   - Example: `expensetracker-receipts-dev-yourname2025`

### Optional Variables

- `aws_region`: AWS region (default: ca-central-1)
- `environment`: Environment name (default: dev)
- `availability_zones`: Availability zones (default: ["ca-central-1a", "ca-central-1b"])
- `db_instance_class`: RDS instance type (default: db.t3.micro)
- `vpc_cidr`: VPC CIDR block (default: 10.0.0.0/16)

## Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads the required providers (AWS) and sets up the backend.

### 2. Validate Configuration

```bash
terraform validate
```

Ensures your configuration is syntactically correct.

### 3. Plan Infrastructure

```bash
terraform plan
```

Shows what resources will be created. Review carefully before applying.

### 4. Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will:
- Create VPC with subnets and routing (~2 minutes)
- Create security groups (~1 minute)
- Create S3 bucket with encryption (~1 minute)
- Set up IAM roles and policies (~1 minute)
- Create CloudWatch log groups (~30 seconds)
- Launch RDS PostgreSQL instance (~10-12 minutes) ⏳

**Total deployment time: ~15 minutes**

### 5. View Outputs

```bash
terraform output
```

Important outputs:
- `rds_endpoint`: Database connection string
- `receipts_bucket_name`: S3 bucket for receipts
- `vpc_id`, `public_subnet_ids`: For ECS deployment (Step 23)

### 6. Save Outputs

```bash
terraform output > ../terraform-outputs.txt
```

Keep this file secure - it contains your infrastructure details.

## Cost Estimation

### Free Tier Eligible Resources (First 12 Months)
- RDS db.t3.micro (750 hours/month) - FREE
- 20 GB RDS storage - FREE
- S3 storage (5 GB free) - FREE
- CloudWatch logs (5 GB free) - FREE

### Estimated Monthly Cost (after free tier)
- RDS db.t3.micro: ~$15/month
- RDS storage (20GB): ~$2.30/month
- RDS enhanced monitoring: ~$1.40/month
- S3 storage: ~$0.10/month (typical receipt usage)
- CloudWatch logs: ~$0.50/month
- **Total: ~$19-20/month** (minimal usage)

**Note**: Backups are disabled for cost optimization (`backup_retention_period = 0`)

## Configuration Notes

### Cost Optimizations Applied
- **No automated backups**: `backup_retention_period = 0` (saves storage costs)
- **Enhanced monitoring enabled**: `monitoring_interval = 60` (provides database metrics)
- **CloudWatch log exports enabled**: PostgreSQL and upgrade logs (aids debugging)
- **Single-AZ deployment**: `multi_az = false` (free tier eligible)
- **No NAT Gateway**: Public subnets only (saves ~$32/month)
- **S3 lifecycle policy**: Receipts deleted after 365 days (saves storage costs)

### Security Notes
- RDS is in public subnets but **not publicly accessible** (`publicly_accessible = false`)
- Security groups restrict access: RDS only accepts connections from ECS tasks
- All data encrypted at rest (RDS with AES256, S3 with AES256)
- S3 bucket has public access blocked (all 4 settings enabled)
- IAM roles follow least-privilege principle
- JWT secrets and database passwords never stored in code

## Managing Secrets

**NEVER commit these files:**
- `terraform.tfvars` (contains secrets)
- `*.tfstate` files (may contain secrets)
- `terraform-outputs.txt` (contains endpoints and resource IDs)

**Secure storage options:**
1. Use environment variables
   ```bash
   export TF_VAR_db_password="your-secure-password"
   export TF_VAR_jwt_secret="your-jwt-secret"
   ```

2. Use AWS Secrets Manager (for production)
3. Use encrypted files with `git-crypt` or similar
4. Store in password manager (1Password, LastPass, etc.)

## Destroying Infrastructure

To tear down all resources:

```bash
terraform destroy
```

Type `yes` when prompted.

**WARNING:** This will delete:
- RDS database (all data lost!)
- S3 bucket (all receipts lost!)
- All networking resources
- IAM roles and policies

**This action cannot be undone!**

## Troubleshooting

### Error: Bucket name already exists
- S3 bucket names are globally unique across ALL AWS accounts
- Solution: Change `receipts_bucket_name` in `terraform.tfvars`
- Add more unique characters (your name, random numbers, current year)

### Error: Insufficient permissions
- Ensure AWS credentials have permissions for:
   - VPC, EC2, RDS, S3, IAM, CloudWatch
- Recommended IAM policies:
   - `PowerUserAccess` (allows creating most resources)
   - `IAMFullAccess` (allows creating IAM roles)

### Error: Cannot find version X.X for postgres
- PostgreSQL versions vary by AWS region
- Solution: Use `engine_version = "15"` to let AWS auto-select the latest 15.x version
- Or check available versions:
  ```bash
  aws rds describe-db-engine-versions \
    --engine postgres \
    --region ca-central-1 \
    --query "DBEngineVersions[?starts_with(EngineVersion, '15')].EngineVersion"
  ```

### RDS taking too long
- RDS instance creation typically takes 10-15 minutes
- Check AWS Console > RDS to monitor progress
- Status will change: Creating → Backing up → Available

### Terraform state locked
- Another terraform operation may be running
- If stuck, you can force-unlock (use carefully):
  ```bash
  terraform force-unlock <LOCK_ID>
  ```

## Verification

After successful deployment, verify in AWS Console:

1. **RDS**: https://ca-central-1.console.aws.amazon.com/rds
   - Should see: `expensetracker-dev-db` with status "Available"

2. **S3**: https://s3.console.aws.amazon.com/s3/buckets
   - Should see your receipts bucket

3. **VPC**: https://ca-central-1.console.aws.amazon.com/vpc
   - Should see: `expensetracker-dev-vpc` with 2 subnets

4. **IAM**: https://console.aws.amazon.com/iam/home#/roles
   - Should see 3 roles: ecs-task-execution-role, ecs-task-role, rds-monitoring-role

## Next Steps

After successful deployment:
1. Save the `rds_endpoint` output - you'll need it for application configuration
2. Save the `receipts_bucket_name` - required for S3 configuration
3. Note the `vpc_id` and `public_subnet_ids` - needed for Step 23
4. Proceed to **Step 23: Terraform - Application & Observability**
5. Deploy ECS cluster, ALB, and application containers

## Deployed Resources Summary

After running `terraform apply`, you'll have:

### Networking (7 resources)
- 1 VPC
- 2 Public Subnets (ca-central-1a, ca-central-1b)
- 1 Internet Gateway
- 1 Route Table
- 2 Route Table Associations
- 1 DB Subnet Group

### Compute & Storage (6 resources)
- 1 RDS PostgreSQL instance (db.t3.micro, 20GB)
- 1 S3 Bucket
- 4 S3 configurations (encryption, public access block, lifecycle, CORS)

### Security (9 resources)
- 3 Security Groups (ALB, ECS, RDS)
- 3 IAM Roles
- 2 IAM Policies
- 4 IAM Policy Attachments

### Monitoring (2 resources)
- 2 CloudWatch Log Groups

**Total: 28 AWS resources**

## References

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

## Support

For issues or questions:
- Check AWS CloudWatch logs for errors
- Review Terraform state: `terraform show`
- Validate configuration: `terraform validate`
- Check AWS service health: https://status.aws.amazon.com/

## License

This infrastructure code is part of the Expense Tracker portfolio project.