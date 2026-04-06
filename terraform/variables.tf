variable "aws_region" {
  description = "AWS region for the demo environment."
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name prefix for AWS resources."
  type        = string
  default     = "shopping-demo"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/20"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets."
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "AZs used for the demo VPC."
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "node_instance_types" {
  description = "EKS managed node group instance types."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired node count."
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum node count."
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum node count."
  type        = number
  default     = 4
}
