output "bucket_name" {
  value       = aws_s3_bucket.packages_bucket.bucket
  description = "The name of the packages bucket."
}
