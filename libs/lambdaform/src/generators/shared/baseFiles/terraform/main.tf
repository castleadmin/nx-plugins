/*
  TODO add backend
  A backend defines where Terraform stores its state data files.
  How to configure a Terraform backend?
  https://developer.hashicorp.com/terraform/language/settings/backends/configuration
  Or how to configure a Terraform cloud backend?
  https://developer.hashicorp.com/terraform/cli/cloud/settings
*/

locals {
  workspace = {
    <%= sharedResourcesName %>-test = {
      profile = "test"
      tags = {
        app = "<%= sharedResourcesName %>"
        env = "test"
      }
    }
    <%= sharedResourcesName %>-staging = {
      profile = "staging"
      tags = {
        app = "<%= sharedResourcesName %>"
        env = "staging"
      }
    }
    <%= sharedResourcesName %>-production = {
      profile = "production"
      tags = {
        app = "<%= sharedResourcesName %>"
        env = "production"
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
