output "bucket_name" {
  value       = module.s3_upload.bucket_name
  description = "The name of the packages bucket."
}
