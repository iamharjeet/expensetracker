terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state file
  # For now using local backend, can be switched to S3 backend later
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ExpenseTracker"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
