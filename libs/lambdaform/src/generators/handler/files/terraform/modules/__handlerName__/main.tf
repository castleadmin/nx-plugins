terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "<%= awsTerraformProvider %>"
    }
  }
}

locals {
  zip_file = "dist/<%= appsDir %>/<%= project %>/<%= handlerName %>/<%= handlerName %>.zip"
  workspace = {
    <%= project %>-test = {
      function_name = "<%= project %>-test-<%= handlerName %>"
    }
    <%= project %>-staging = {
      function_name = "<%= project %>-staging-<%= handlerName %>"
    }
    <%= project %>-production = {
      function_name = "<%= project %>-production-<%= handlerName %>"
    }
  }
}

data "aws_iam_policy_document" "<%= handlerName %>_assume_role_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "<%= handlerName %>_iam_policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = ["${aws_cloudwatch_log_group.<%= handlerName %>_log_group.arn}:log-stream:*"]

    condition {
      test     = "ArnEquals"
      variable = "lambda:SourceFunctionArn"
      values   = [aws_lambda_function.<%= handlerName %>.arn]
    }
  }
}

resource "aws_iam_role" "<%= handlerName %>_iam_role" {
  name               = local.workspace[terraform.workspace].function_name
  description        = "Role for Lambda function ${local.workspace[terraform.workspace].function_name}"
  assume_role_policy = data.aws_iam_policy_document.<%= handlerName %>_assume_role_policy.json
  <% if (xray) { %>
  managed_policies = ["arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"]
  <% } %>
}

resource "aws_iam_role_policy" "<%= handlerName %>_iam_role_policy" {
  name   = local.workspace[terraform.workspace].function_name
  role   = aws_iam_role.<%= handlerName %>_iam_role
  policy = data.aws_iam_policy_document.<%= handlerName %>_iam_policy.json
}

resource "aws_cloudwatch_log_group" "<%= handlerName %>_log_group" {
  name              = "/aws/lambda/${local.workspace[terraform.workspace].function_name}"
  retention_in_days = 90
}
<% if (s3Upload) { %>
data "aws_s3_bucket" "packages_bucket" {
  bucket = var.bucket_name
}

resource "aws_s3_object" "<%= handlerName %>_s3_object" {
  key         = "<%= handlerName %>"
  bucket      = data.aws_s3_bucket.packages_bucket.id
  source      = local.zip_file
  source_hash = filebase64sha512(local.zip_file)
}
<% } %>
resource "aws_lambda_function" "<%= handlerName %>" {
  function_name = local.workspace[terraform.workspace].function_name
  role          = aws_iam_role.<%= handlerName %>_iam_role
  <% if (s3Upload) { %>
  s3_bucket         = data.aws_s3_bucket.packages_bucket.id
  s3_key            = aws_s3_object.<%= handlerName %>_s3_object.id
  s3_object_version = aws_s3_object.<%= handlerName %>_s3_object.version_id
  <% } else { %>
  filename         = local.zip_file
  source_code_hash = filebase64sha512(local.zip_file)
  <% } %>
  handler = "<%= handlerName %>.js"

  runtime       = "nodejs18.x"
  architectures = ["arm64"] // arm64 (cost-efficient) or x86_64
  memory_size   = 128       // Minimum: 128 MB, Maximum: 10240 MB, Restriction: The value is a multiple of 1 MB
  // Minimum: 1 second, Maximum: 900 seconds
  // Restriction: The maximum timeout for Lambdas invoked from API Gateway or AppSync is 29 seconds
  timeout = 29
  <% if (xray) { %>
  tracing_config {
    mode = "Active"
  }
  <% } %>
}
