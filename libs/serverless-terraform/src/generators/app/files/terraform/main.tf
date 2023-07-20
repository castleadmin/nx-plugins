// TODO add backend

locals {
  workspace = {
    <%= name %>-staging = {
      profile = "staging"
      tags = {
        app     = "<%= name %>"
        env     = "staging"
      }
    }
    <%= name %>-production = {
      profile = "production"
      tags = {
        app     = "<%= name %>"
        env     = "production"
      }
    }
  }
}

provider "aws" {
  profile                  = local.workspace[terraform.workspace].profile
  shared_config_files      = ["~/.aws/config"]
  shared_credentials_files = ["~/.aws/credentials"]

  default_tags {
    tags = local.workspace[terraform.workspace].tags
  }
}
