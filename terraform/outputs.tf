output "vpc_id" {
  description = "VPC ID for the demo environment."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs."
  value       = aws_subnet.private[*].id
}

output "eks_cluster_name" {
  description = "EKS cluster name."
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint."
  value       = aws_eks_cluster.main.endpoint
}

output "web_ecr_repository_url" {
  description = "ECR repository URL for the web image."
  value       = aws_ecr_repository.web.repository_url
}

output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image."
  value       = aws_ecr_repository.api.repository_url
}
