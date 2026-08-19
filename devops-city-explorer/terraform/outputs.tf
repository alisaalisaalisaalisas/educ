output "vpc_id" {
  description = "ID of the VPC created"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "web_security_group_id" {
  description = "ID of the security group for HTTP/HTTPS"
  value       = aws_security_group.web.id
}

output "s3_assets_bucket_name" {
  description = "Name of the S3 storage bucket"
  value       = aws_s3_bucket.assets.id
}

output "s3_assets_bucket_arn" {
  description = "ARN of the S3 storage bucket"
  value       = aws_s3_bucket.assets.arn
}
