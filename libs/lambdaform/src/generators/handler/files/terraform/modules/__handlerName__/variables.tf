<% if (s3Upload) { %>
variable "bucket_name" {
  type        = string
  nullable    = false
  description = "Name of the S3 bucket that is used to upload the <%= handlerName %> package."
}
<% } %>
