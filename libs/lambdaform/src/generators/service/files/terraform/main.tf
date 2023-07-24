/*
  TODO add backend
  A backend defines where Terraform stores its state data files.
  How to configure a Terraform backend?
  https://developer.hashicorp.com/terraform/language/settings/backends/configuration
  Or how to configure a Terraform cloud backend?
  https://developer.hashicorp.com/terraform/cli/cloud/settings
*/

locals {
  workspaces = {
    <%= serviceNameTf %>_test = {
      profile = "test"
      tags = {
        app = "<%= serviceName %>"
        env = "test"
      }
    }
    <%= serviceNameTf %>_staging = {
      profile = "staging"
      tags = {
        app = "<%= serviceName %>"
        env = "staging"
      }
    }
    <%= serviceNameTf %>_production = {
      profile = "production"
      tags = {
        app = "<%= serviceName %>"
        env = "production"
      }
    }
  }
}

provider "aws" {
  profile                  = local.workspaces[terraform.workspace].profile
  shared_config_files      = ["~/.aws/config"]
  shared_credentials_files = ["~/.aws/credentials"]

  default_tags {
    tags = local.workspaces[terraform.workspace].tags
  }
}
