output "database_url" {
  description = "DNS endpoing for RDS instance"
  value       = aws_db_instance.postgres.endpoint
}
output "redis_url" {
  description = "Endpoint for ElastiCache cluster"
  value       = "${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
}
output "ec2_ip" {
  description = "IP address for EC2 instance"
  value       = data.aws_eip.static.public_ip
}
output "api_url" {
  description = "URL to access the Task Manager API"
  value       = "http://${data.aws_eip.static.public_ip}:8000"
}
output "api_docs_url" {
  description = "API documentation"
  value       = "http://${data.aws_eip.static.public_ip}:8000/docs"
}
output "ssh_command" {
  description = "SSH into EC2"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${data.aws_eip.static.public_ip}"
}
output "sns_topic_arn" {
  value = aws_sns_topic.notifications.arn
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend files"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://faros.odysian.dev"
}