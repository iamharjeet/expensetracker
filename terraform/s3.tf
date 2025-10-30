# S3 Bucket for Receipt Storage
resource "aws_s3_bucket" "receipts" {
  bucket = var.receipts_bucket_name

  tags = {
    Name        = "${var.project_name}-${var.environment}-receipts"
    Environment = var.environment
  }
}

# Block public access to the bucket
resource "aws_s3_bucket_public_access_block" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning (optional - disabled for cost optimization)
# Uncomment if you want versioning
# resource "aws_s3_bucket_versioning" "receipts" {
#   bucket = aws_s3_bucket.receipts.id
#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# Server-side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle policy to delete old receipts (optional - cost optimization)
resource "aws_s3_bucket_lifecycle_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    id     = "delete-old-receipts"
    status = "Enabled"

    # Apply to all objects in the bucket
    filter {}

    # Delete objects older than 365 days (1 year)
    expiration {
      days = 365
    }

    # Delete incomplete multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# CORS configuration for direct browser uploads (if needed in future)
resource "aws_s3_bucket_cors_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"] # Restrict this in production to your domain
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
