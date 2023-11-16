output "bucket_name" {
  value       = module.s3_upload.bucket_name
  description = "The full name of the <%= bucketName %> bucket."
}
