# CloudWatch Log Group for ECS Application Logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7 # Keep logs for 7 days (adjust as needed)

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-logs"
    Environment = var.environment
  }
}

# CloudWatch Log Group for ECS Task Execution (system logs)
resource "aws_cloudwatch_log_group" "ecs_task" {
  name              = "/ecs/${var.project_name}-${var.environment}-task"
  retention_in_days = 3 # Keep system logs for 3 days

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-task-logs"
    Environment = var.environment
  }
}
