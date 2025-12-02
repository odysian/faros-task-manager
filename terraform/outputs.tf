output "database_url" {
  description = "DNS endpoing for RDS instance"
  value       = aws_db_instance.postgres.endpoint
}
output "redis_url" {
  description = "Endpoint for Elasticache cluster"
  value       = aws_elasticache_cluster.redis.configuration_endpoint
}
output "ec2_ip" {
  description = "IP address for EC2 instance"
  value       = aws_instance.default.public_ip
}

