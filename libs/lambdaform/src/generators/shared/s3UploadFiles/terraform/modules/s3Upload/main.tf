terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "<%= awsTerraformProvider %>"
    }
  }
}

locals {
  workspaces = {
    <%= sharedResourcesName %>-test = {
      bucket_name = "test-packages"
    }
    <%= sharedResourcesName %>-staging = {
      bucket_name = "staging-packages"
    }
    <%= sharedResourcesName %>-production = {
      bucket_name = "production-packages"
    }
  }
}

resource "aws_s3_bucket" "packages_bucket" {
  bucket = local.workspaces[terraform.workspace].bucket_name
}

resource "aws_s3_bucket_acl" "packages_acl" {
  bucket = aws_s3_bucket.packages_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "packages_encryption" {
  bucket = aws_s3_bucket.packages_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "packages_versioning" {
  bucket = aws_s3_bucket.packages_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "packages_lifecycle" {
  depends_on = [aws_s3_bucket_versioning.packages_versioning]
  bucket     = aws_s3_bucket.packages_bucket.id

  rule {
    id     = local.workspaces[terraform.workspace].bucket_name
    status = "Enabled"

    noncurrent_version_expiration {
      newer_noncurrent_versions = 2  // 2 old versions will be retained per file.
      noncurrent_days           = 90 // The old versions will be retained for 90 days and deleted afterwards.
    }
  }
}
