output "bucket_name" {
  value       = aws_s3_bucket.<%= bucketName %>_bucket.bucket
  description = "The full name of the <%= bucketName %> bucket."
}
