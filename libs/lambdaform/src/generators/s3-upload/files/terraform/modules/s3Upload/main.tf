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
    <%= project %>-test = {
      bucket_name = "<%= bucketName %>-test"
    }
    <%= project %>-staging = {
      bucket_name = "<%= bucketName %>-staging"
    }
    <%= project %>-production = {
      bucket_name = "<%= bucketName %>-production"
    }
  }
}

resource "aws_s3_bucket" "<%= bucketName %>_bucket" {
  bucket = local.workspaces[terraform.workspace].bucket_name
}

resource "aws_s3_bucket_acl" "<%= bucketName %>_acl" {
  bucket = aws_s3_bucket.<%= bucketName %>_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "<%= bucketName %>_encryption" {
  bucket = aws_s3_bucket.<%= bucketName %>_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "<%= bucketName %>_versioning" {
  bucket = aws_s3_bucket.<%= bucketName %>_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "<%= bucketName %>_lifecycle" {
  depends_on = [aws_s3_bucket_versioning.<%= bucketName %>_versioning]
  bucket     = aws_s3_bucket.<%= bucketName %>_bucket.id

  rule {
    id     = local.workspaces[terraform.workspace].bucket_name
    status = "Enabled"

    noncurrent_version_expiration {
      newer_noncurrent_versions = 5  // 5 old versions will be retained per file.
      noncurrent_days           = 90 // The old versions will be retained for 90 days and deleted afterwards.
    }
  }
}
