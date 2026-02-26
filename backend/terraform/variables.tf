variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "taskmanager"
}
variable "db_password" {
  description = "RDS master password"
  sensitive   = true
  type        = string
}
variable "db_username" {
  description = "Username for RDS"
  type        = string
  default     = "task_user"
}
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "task_manager"
}
variable "secret_key" {
  description = "JWT secret key for FastAPI app"
  type        = string
  sensitive   = true
}
variable "aws_access_key_id" {
  description = "AWS access key credentials"
  type        = string
  sensitive   = true
}
variable "aws_secret_access_key" {
  description = "AWS secret access key credential"
  type        = string
  sensitive   = true
}
variable "s3_bucket_name" {
  description = "Bucket name for S3"
  type        = string
  default     = "task-manager-uploads-cjc3x3"
}
variable "key_name" {
  description = "EC2 key pair name"
  type        = string
  default     = "taskmanager-key"
}
variable "github_repo" {
  description = "Github project repo URL"
  type        = string
  default     = "https://github.com/odysian/task-manager-api.git"
}
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}
variable "allowed_ssh_cidr" {
  description = "Restrict SSH to my IP"
  type        = string
  default     = "0.0.0.0/0"
}
variable "backend_domain" {
  description = "Backend API domain name"
  type        = string
  default     = "api.faros.odysian.dev"
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = "faros.odysian.dev"
}

variable "ssl_email" {
  description = "Email for Let's Encrypt SSL certificates"
  type        = string
  default     = "odysian7@gmail.com"
}