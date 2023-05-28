terraform {
  backend "s3" {
    bucket  = "meetmaxapi-terreform-state"
    key     = "production/meetmaxapi.tfstate"
    region  = "ap-southeast-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Ngoc Tien Le"
  }
}
