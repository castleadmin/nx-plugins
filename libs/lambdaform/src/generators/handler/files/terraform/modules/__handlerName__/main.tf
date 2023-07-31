terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "<%= awsTerraformProvider %>"
    }
  }
}

locals {
  zip_file = "../../../dist/<%= appsDir %>/<%= project %>/<%= handlerName %>.zip"
  workspaces = {
    <%= projectTf %>_test = {
      env           = "test"
      function_name = "<%= project %>-test-<%= handlerName %>"
    }
    <%= projectTf %>_staging = {
      env           = "staging"
      function_name = "<%= project %>-staging-<%= handlerName %>"
    }
    <%= projectTf %>_production = {
      env           = "production"
      function_name = "<%= project %>-production-<%= handlerName %>"
    }
  }
}

data "aws_iam_policy_document" "<%= handlerNameTf %>_assume_role_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "<%= handlerNameTf %>_iam_policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = ["${aws_cloudwatch_log_group.<%= handlerNameTf %>_log_group.arn}:log-stream:*"]

    condition {
      test     = "ArnEquals"
      variable = "lambda:SourceFunctionArn"
      values   = [aws_lambda_function.<%= handlerNameTf %>.arn]
    }
  }
}

resource "aws_iam_role" "<%= handlerNameTf %>_iam_role" {
  name               = local.workspaces[terraform.workspace].function_name
  description        = "Role for Lambda function ${local.workspaces[terraform.workspace].function_name}"
  assume_role_policy = data.aws_iam_policy_document.<%= handlerNameTf %>_assume_role_policy.json
  <% if (xray) { %>
  managed_policy_arns = ["arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"]
  <% } %>
}

resource "aws_iam_role_policy" "<%= handlerNameTf %>_iam_role_policy" {
  name   = local.workspaces[terraform.workspace].function_name
  role   = aws_iam_role.<%= handlerNameTf %>_iam_role.id
  policy = data.aws_iam_policy_document.<%= handlerNameTf %>_iam_policy.json
}

resource "aws_cloudwatch_log_group" "<%= handlerNameTf %>_log_group" {
  name              = "/aws/lambda/${local.workspaces[terraform.workspace].function_name}"
  retention_in_days = 90
}
<% if (s3Upload) { %>
data "aws_ssm_parameter" "<%= handlerNameTf %>_bucket_ssm_parameter" {
  name = "/${local.workspaces[terraform.workspace].env}/s3/bucket/name/upload"
}

data "aws_s3_bucket" "<%= handlerNameTf %>_bucket" {
  bucket = data.aws_ssm_parameter.<%= handlerNameTf %>_bucket_ssm_parameter.insecure_value
}

resource "aws_s3_object" "<%= handlerNameTf %>_s3_object" {
  key         = "<%= handlerName %>"
  bucket      = data.aws_s3_bucket.<%= handlerNameTf %>_bucket.id
  source      = local.zip_file
  source_hash = filebase64sha512(local.zip_file)
}
<% } %>
resource "aws_lambda_function" "<%= handlerNameTf %>" {
  function_name = local.workspaces[terraform.workspace].function_name
  role          = aws_iam_role.<%= handlerNameTf %>_iam_role.arn
  <% if (s3Upload) { %>
  s3_bucket         = data.aws_s3_bucket.<%= handlerNameTf %>_bucket.id
  s3_key            = aws_s3_object.<%= handlerNameTf %>_s3_object.id
  s3_object_version = aws_s3_object.<%= handlerNameTf %>_s3_object.version_id
  <% } else { %>
  filename         = local.zip_file
  source_code_hash = filebase64sha512(local.zip_file)
  <% } %>
  handler = "index.handler"

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
