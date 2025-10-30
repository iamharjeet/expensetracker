variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "expensetracker"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro" # Free tier eligible
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "expensetracker"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20 # Free tier allows up to 20GB
}

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 8080
}

# JWT Configuration
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

# AWS S3 Configuration (for receipts)
variable "receipts_bucket_name" {
  description = "S3 bucket name for receipt storage (must be globally unique)"
  type        = string
}
