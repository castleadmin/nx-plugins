module "<%= handlerName %>" {
  source = "./modules/<%= handlerName %>"
  <% if (s3Upload) { %>
  bucket_name = s3_upload.bucket_name
  <% } %>
}
