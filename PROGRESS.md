# Cloud-Native Expense Tracker - Progress Tracker


**GitHub Repository:** https://github.com/iamharjeet/expensetracker

You're absolutely right! Let's update the PROGRESS.md file to match the complete 25-step roadmap from the "Roadmap and Progress.docx" file.
Update PROGRESS.md with all 25 steps
Replace the entire content of PROGRESS.md with:
markdown# Cloud-Native Expense Tracker - Progress Tracker

**GitHub Repository:** https://github.com/iamharjeet/expensetracker

## Completed Steps
- [x] Step 1: Project Setup & GitHub Repository ✅
- [x] Step 2: Simple Database & Docker Setup ✅
- [x] Step 3: Basic REST API - User CRUD ✅
- [x] Step 4: Simple Frontend - Part 1 (Structure & Users) ✅
- [x] Step 5: Second Entity - Expenses (Simplified) ✅
- [x] Step 6: Add Basic Security (Simple JWT) ✅
- [x] Step 7: User Registration (Simplified - No Email Verification) ✅
- [x] Step 8: Enhance Data Model - Categories & Accounts ✅
- [x] Step 9: Add Database Migrations (Essential) ✅
- [x] Step 10: Enhanced Expense Management with Pagination & Filtering ✅
- [x] Step 11: Budget Management (Minimal) ✅
- [ ] Step 12: Improve Frontend - Dashboard & Charts (DEFERRED - Post-MVP)
- [x] Step 13: Code Refactoring & Testing Foundation (Minimal - Exception Handling) ✅
- [x] Step 14: File Upload - Receipts (Local First) ✅
- [x] Step 15: Reporting & Export with Testing ✅
- [ ] Step 16: Professional Email System (DEFERRED - Post-MVP)
- [x] Step 17: API Documentation (MINIMAL) ✅
- [ ] Step 18: Integration Testing & Test Coverage (DEFERRED - Post-MVP)
- [x] Step 19: AWS S3 Integration (Replace Local Storage) ✅
- [x] Step 20: Dockerize the Application ✅
- [ ] Step 21: Environment Configuration & Secrets (DEFERRED - Already handled via env vars in Step 20, secrets will be managed in ECS Task Definition)
- [x] Step 22: Terraform - Core Infrastructure ✅
- [x] Step 23: Terraform - Application & Observability ✅
- [x] Step 24: CI/CD Pipeline ✅
- [ ] Step 25: Production Readiness & Documentation

## Current Step: 25

## Notes:
- Step 1 completed: Basic Spring Boot project created
- GitHub repository initialized and pushed
- Dependencies: Spring Web, Spring Data JPA, PostgreSQL, Lombok
- Step 2 completed: PostgreSQL running in Docker, User entity with timestamps and UserRepository created
- Database table 'users' successfully created with all fields including created_at and updated_at
- Step 3 completed: Built complete REST API for user management
- Created 3 new packages: dto, service, controller
- Created UserDTO, UserService, UserController
- Implemented 5 REST endpoints (GET all, GET by ID, POST, PUT, DELETE)
- Successfully tested all endpoints with Postman
- Layered architecture working: Controller → Service → Repository → Database
- Step 4 completed: Built complete frontend user interface
- Created 4 files in src/main/resources/static: index.html, users.html, styles.css, js/app.js
- Two-column responsive layout with modern card-based design
- Full CRUD functionality: Create, Read, Update, Delete users via UI
- Features: loading spinner, success/error messages, user count badge, empty state, smooth animations
- Application accessible at http://localhost:8080 with working frontend-backend integration 
- Step 5 completed: Built complete expense tracking system
- Created Expense entity with BigDecimal for amount, LocalDate for date, and audit timestamps
- Created ExpenseRepository with custom query methods (findByUserId, findByUserIdOrderByDateDesc)
- Created ExpenseDTO, ExpenseService, ExpenseController following same layered architecture
- Implemented 6 REST endpoints including special endpoint for getting expenses by user
- Created expenses.html with enhanced styling and two-column layout
- Created expenses.js with full CRUD operations, amount/date formatting, loading states
- Updated styles.css with clean, minimal design for better UI across all pages
- Database table 'expenses' successfully created with all fields and proper constraints
- Successfully tested complete expense management flow: add, edit, delete, view
- - Steps 6 & 7 completed: Implemented JWT-based authentication and user registration
- Added Spring Security and JWT dependencies (jjwt-api, jjwt-impl, jjwt-jackson)
- Updated User entity with 'enabled' field for future email verification feature
- Created security package with JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService, SecurityConfig
- Created auth package with LoginRequest, LoginResponse, RegisterRequest DTOs
- Created AuthService handling registration (with BCrypt password encryption) and login logic
- Created AuthController with /api/auth/register and /api/auth/login endpoints
- Implemented SecurityConfig to protect all /api/** endpoints except /api/auth/**
- Created frontend authentication pages: login.html and register.html with modern gradient design
- Created auth.js handling login/register API calls, JWT token storage in localStorage
- Updated index.html to show login/register buttons or welcome message based on auth state
- Updated users.html and expenses.html with user info bar, logout button, and authentication protection
- Updated app.js and expenses.js to include JWT token in all API requests with Authorization header
- Added automatic redirect to login page when accessing protected pages without authentication
- Added 401/403 response handling to logout users with invalid/expired tokens
- Successfully tested complete authentication flow: register → login → access protected pages → logout
- All CRUD operations for users and expenses now require valid JWT authentication
- Step 8 completed: Enhanced data model with Categories and Accounts
- Created Category entity (id, name, type enum, timestamps) and Account entity (id, name, balance, type, userId, timestamps)
- Updated Expense entity with categoryId and accountId foreign keys
- Created CategoryRepository (findByType, findByOrderByNameAsc) and AccountRepository (findByUserId, findByUserIdOrderByNameAsc)
- Created CategoryDTO, AccountDTO, and updated ExpenseDTO with categoryName and accountName fields
- Created CategoryService (read-only) and AccountService (full CRUD)
- Updated ExpenseService to fetch and populate category/account names in DTOs
- Created CategoryController (3 endpoints: GET all, GET by type, GET by id) and AccountController (6 CRUD endpoints)
- Created new config package with DataInitializer.java to auto-populate 12 default categories on startup (4 INCOME, 8 EXPENSE)
- Created categories.html with filter tabs (All/Income/Expense) and categories.js for display logic
- Created accounts.html with two-column layout (form + list) and accounts.js with full CRUD
- Updated expenses.html with category and account dropdowns, and expenses.js to load/display category and account data
- Updated LoginResponse and AuthService to include userId, updated auth.js to store userId in localStorage
- Enhanced styles.css with category cards, tabs, account badges, and responsive design
- Database tables 'categories' and 'accounts' created, expense table updated with category_id and account_id columns
- Successfully tested categories display with filtering, accounts CRUD, and expense tracking with categorization
- Step 9 completed: Added professional database migration system using Flyway
- Added Flyway dependencies (flyway-core and flyway-database-postgresql) to pom.xml for database versioning
- Created db/migration folder structure under src/main/resources
- Created 4 migration SQL files: V1__create_users_table.sql, V2__create_categories_table.sql, V3__create_accounts_table.sql, and V4__create_expenses_table.sql
- Implemented foreign key constraints in migrations: expenses → users (ON DELETE CASCADE), expenses → categories (ON DELETE SET NULL), expenses → accounts (ON DELETE SET NULL), accounts → users (ON DELETE CASCADE)
- Updated application.properties to change spring.jpa.hibernate.ddl-auto from 'update' to 'validate' and enabled Flyway with baseline-on-migrate setting
- Successfully tested migrations by dropping the database, running the application, and verifying all 4 tables plus flyway_schema_history table were created correctly with proper constraints
- Database schema is now version-controlled and reproducible across all environments
  Step 10 completed: Enhanced expense management with pagination, filtering, and search capabilities by updating ExpenseRepository.java with a native SQL query supporting pagination (10 items per page), 
- date range filtering (startDate, endDate), category and account filtering, and case-insensitive description search using COALESCE for null handling. Updated ExpenseService.java with getExpensesWithFilters method returning paginated response with metadata (currentPage, totalPages, totalItems, hasNext, hasPrevious), 
- and ExpenseController.java with new GET /api/expenses/user/{userId}/paginated endpoint. Enhanced expenses.html with filters section (date pickers, category/account dropdowns, search box, clear filters button) and pagination controls (Previous/Next buttons, page info display). Updated expenses.js with pagination state management, 
- debounced search (500ms delay), applyFilters, clearFilters, goToNextPage, and goToPreviousPage functions. Enhanced styles.css with filters section styling, pagination controls styling, and responsive design for mobile. Successfully tested all features: pagination navigation, individual filters, combined filters, search functionality, 
- clear filters, and CRUD operations with pagination. No new files or folders were created; only existing files were modified. 
- Step 11 completed: Implemented minimal budget management system
- Created Budget entity with Flyway migration V5__create_budgets_table.sql
- Created BudgetRepository, BudgetDTO, BudgetService with calculateSpent() method, BudgetController (6 endpoints)
- Implemented 6 REST endpoints: GET /api/budgets/user/{userId}, GET /api/budgets/user/{userId}/month/{month}/year/{year}, GET /api/budgets/{id}, POST /api/budgets, PUT /api/budgets/{id}, DELETE /api/budgets/{id}
- Created budgets.html and budgets.js with CRUD operations and over-budget detection
- Updated styles.css with budget styling (color-coded borders, pulse animation for over-budget badge)
- Updated users.html navigation to include Budgets link
- Successfully tested budget tracking with spent calculation from expenses and over-budget warnings
- Step 12: DEFERRED to Post-MVP (Dashboard & Charts) - Skipped to focus on backend engineering and cloud deployment
- Step 13 completed: Implemented professional exception handling framework
- Created exception package (com.harjeet.expensetracker.exception) with 3 new classes: ResourceNotFoundException.java, BadRequestException.java, and ErrorResponse.java
- Created GlobalExceptionHandler.java with @ControllerAdvice for centralized exception handling across all controllers
- Implemented 3 exception handlers: ResourceNotFoundException (404), BadRequestException (400), and generic Exception (500)
- All exception handlers return consistent JSON error responses with timestamp, status, error type, message, and request path
- Added spring-boot-starter-test dependency (includes JUnit 5, Mockito, AssertJ) for future testing capability
- Updated UserService.java to throw ResourceNotFoundException in getUserById(), updateUser(), and deleteUser() methods
- Successfully tested exception handling with Postman, verified proper 404 JSON responses for non-existent users
- Comprehensive test writing deferred to post-deployment phase to meet project deadline
- Step 14 completed: Implemented receipt upload/download system with local file storage
- Created Receipt entity, ReceiptRepository, ReceiptDTO, ReceiptService, ReceiptController
- Created FileStorageService for local file storage in /uploads folder with validation (max 5MB, jpg/png/pdf only)
- Created Flyway migration V6__create_receipts_table.sql with CASCADE delete
- Implemented 3 REST endpoints: POST /api/receipts/upload, GET /api/receipts/{id}/download, GET /api/receipts/expense/{expenseId}
- Updated expenses.html with file input field and Receipt column in table
- Updated expenses.js with async upload/download logic and automatic receipt loading
- Successfully tested complete flow: create/edit expenses with receipts, download receipts, file validation
- Step 15 completed: Implemented minimal reporting and CSV export system
- Created ReportService.java with monthly summary calculations and top spending categories logic
- Created ReportController.java with 2 REST endpoints (monthly summary JSON, CSV export download)
- Updated ExpenseRepository.java with findByUserIdAndDateBetween() method for date range queries
- Created reports.html with month/year selector, summary cards, and CSV export section
- Created reports.js with API integration for summaries and CSV downloads
- Enhanced styles.css with summary cards, category table, and responsive design
- Updated navigation in all pages (users.html, expenses.html, categories.html, accounts.html, budgets.html)
- Successfully tested monthly summary with income/expense calculations and top 5 categories ranking
- Successfully tested CSV export with proper formatting and date range filtering 
- Step 16: DEFERRED to Post-MVP (Dashboard & Charts) - Skipped to focus on backend engineering and cloud deployment
- Step 17 completed: Implemented professional API documentation using Springdoc OpenAPI
- Added springdoc-openapi-starter-webmvc-ui dependency (version 2.7.0) to pom.xml
- Created OpenApiConfig.java in config package with JWT bearer authentication configuration
- Updated SecurityConfig.java to permit Swagger UI endpoints
- Configured Swagger UI in application.properties with custom paths and settings
- Interactive API documentation accessible at http://localhost:8080/swagger-ui.html
- All 8 controllers auto-documented with request/response schemas
- JWT authentication working via Authorize button in Swagger UI
- Successfully tested protected endpoints from Swagger interface
- Step 18: DEFERRED to Post-MVP (Integration Testing & Test Coverage) - Skipped to focus on backend engineering and cloud deployment
- Step 19 completed: Migrated receipt storage from local file system to AWS S3
- Added AWS SDK dependencies (software.amazon.awssdk:s3 and software.amazon.awssdk:auth version 2.20.26) to pom.xml
- Created AWS S3 bucket `expensetracker-receipts-harjeet-dev` in ca-central-1 region with IAM user for access
- Updated application.properties with AWS S3 configuration (bucket name, region, pre-signed URL expiration, credentials via local.properties)
- Created AwsS3Config.java with S3Client and S3Presigner beans for AWS operations
- Created new DTOs: ReceiptUploadResponse.java and ReceiptUrlResponse.java for S3 responses
- Created S3StorageService.java with methods for uploadFile, generatePresignedUrl, deleteFile, and fileExists with file validation (max 10MB, jpg/png/gif/pdf only)
- Updated ReceiptService.java to use S3StorageService instead of FileStorageService with enhanced security and expenseId validation
- Updated ReceiptController.java with new endpoints: POST /upload (with userId), GET /{id}/url (returns pre-signed URL), DELETE /{id}
- Updated Receipt.java entity to make expenseId nullable for standalone uploads
- Created Flyway migration V7__alter_receipts_expense_id_nullable.sql
- Updated expenses.js frontend to include userId in uploads and use pre-signed URLs for downloads
- Successfully tested all receipt operations: upload to S3, generate download URLs, link to expenses, and delete from S3
- Receipts now organized in S3 by user: receipts/{userId}/{timestamp}_{uuid}.{ext}
- Step 20 completed: Successfully dockerized the application with multi-container setup
- Created Dockerfile with multi-stage build (Maven build stage using eclipse-temurin:21-alpine + JRE runtime stage)
- Created .dockerignore file to optimize Docker build context (excludes target/, IDE files, logs, documentation)
- Updated docker-compose.yml to include app service alongside PostgreSQL with proper networking and health checks
- Configured environment variables in docker-compose.yml for database connection, JWT secrets, and AWS S3 credentials
- Created .env.example template file for environment variable documentation
- Updated application.properties to support environment variable overrides using ${VAR:default} pattern for database, JWT, and AWS configuration
- Added Spring Boot Actuator dependency for health monitoring (spring-boot-starter-actuator)
- Commented out deprecated FileStorageService (@Service annotation) as application now uses S3StorageService
- Configured Spring Actuator endpoints in application.properties (health, info exposed)
- Created Docker bridge network 'expensetracker-network' for inter-container communication
- Successfully built Docker image and tested multi-container deployment with docker-compose up --build
- Verified PostgreSQL health checks, Flyway migrations execution in containerized environment
- Tested health endpoint (http://localhost:8080/actuator/health) returning status UP
- Confirmed all REST endpoints working in containerized environment (register, login, expenses, budgets, receipts)
- Application runs as non-root user 'spring' for security
- Docker image uses JRE (not JDK) for smaller production image size
- Successfully tested complete flow: container startup → database migration → app initialization → API access
  Step 21: DEFERRED to Post-MVP
- Step 22 completed: Implemented Terraform Infrastructure as Code (IaC) for AWS deployment in ca-central-1 (Canada - Montreal) region. 
- Created comprehensive cloud infrastructure including VPC with 2 public subnets across multiple availability zones (ca-central-1a, ca-central-1b), Internet Gateway, and route tables for network connectivity. 
- Provisioned RDS PostgreSQL 15 database (db.t3.micro, 20GB GP3 storage, encrypted at rest) with automated backups disabled for cost optimization, enhanced monitoring enabled (60-second intervals) with CloudWatch logs export (postgresql, upgrade logs), and IAM role for RDS monitoring. 
- Created S3 bucket (expensetracker-receipts-dev-harjeet2025) for receipt storage with server-side encryption (AES256), public access blocked, lifecycle policy (365-day retention with automatic deletion), CORS configuration for future browser uploads, and abort incomplete multipart uploads after 7 days. 
- Implemented IAM security with 3 roles (ECS task execution role with AmazonECSTaskExecutionRolePolicy, ECS task role with S3 and CloudWatch permissions, RDS monitoring role with AmazonRDSEnhancedMonitoringRole) and 2 custom policies for S3 access (PutObject, GetObject, DeleteObject, ListBucket) and CloudWatch logs (CreateLogGroup, CreateLogStream, PutLogEvents). 
- Configured 3 security groups for network isolation: ALB security group (allows HTTP/HTTPS from internet), ECS tasks security group (allows traffic from ALB on port 8080), and RDS security group (allows PostgreSQL port 5432 only from ECS tasks, blocks all other access). 
- Set up 2 CloudWatch log groups (/ecs/expensetracker-dev with 7-day retention, /ecs/expensetracker-dev-task with 3-day retention). 
- Total infrastructure: 28 AWS resources deployed via 12 Terraform files (main.tf, variables.tf, vpc.tf, security-groups.tf, rds.tf, s3.tf, iam.tf, cloudwatch.tf, outputs.tf, terraform.tfvars.example, .gitignore, README.md). 
- Successfully demonstrated Infrastructure as Code best practices, cost optimization (free tier eligible, single-AZ RDS, no NAT Gateway saves $32/month, S3 lifecycle policies), security hardening (encryption at rest and in transit, network isolation via security groups, RDS not publicly accessible despite being in public subnet, least privilege IAM policies, all secrets externalized), and professional DevOps workflow with comprehensive documentation. 
- All outputs captured including RDS endpoint (expensetracker-dev-db.cnaayeogwvw9.ca-central-1.rds.amazonaws.com:5432), VPC ID (vpc-0df89024018d1f104), subnet IDs, security group IDs, IAM role ARNs, and S3 bucket name for use in Step 23 (ECS deployment). 
- Estimated monthly cost: ~$19-20 after free tier expires.
- Step 23 completed: Deployed application to AWS ECS Fargate with full observability
- Created 2 new Terraform files: ecs.tf (ECS Fargate cluster, task definition with environment variables, service with public IP) and cloudwatch-enhanced.tf (5 CloudWatch alarms for ECS/RDS monitoring, CloudWatch dashboard for visualization)
- Updated 3 existing Terraform files: variables.tf (added docker_image, ecs_task_cpu, ecs_task_memory, ecs_desired_count), outputs.tf (added ECS outputs and app access instructions), security-groups.tf (added public access rule on port 8080)
- Fixed AwsS3Config.java to use DefaultCredentialsProvider for IAM role authentication instead of hardcoded AWS credentials
- Pushed Docker image to Docker Hub (iamharjeet/expensetracker:latest) for deployment
- Deployed 11 new AWS resources via terraform apply: 1 ECS cluster, 1 task definition, 1 service, 5 alarms, 1 dashboard, plus updated security group
- Application running serverless on ECS Fargate at http://35.183.95.236:8080
- Using ECS Task IAM Role for S3 access (no AWS credentials needed in environment variables)
- Connected to RDS PostgreSQL database with Flyway migrations applied successfully
- Full CloudWatch monitoring: CPU/Memory alarms for ECS, CPU/Storage/Connections alarms for RDS
- CloudWatch Dashboard displays real-time metrics for ECS and RDS resources
- Cost optimization: No ALB ($16/month saved), Docker Hub instead of ECR ($1/month saved), single task (256 CPU, 512 MB RAM)
- Total cost: $0/month within AWS free tier (first 12 months), ~$27/month after free tier expires
- Production-grade deployment: Infrastructure as Code, container orchestration, comprehensive observability
- Step 24 completed: Implemented automated CI/CD pipeline using GitHub Actions with three-job workflow for continuous deployment to AWS ECS. 
- Created .github/workflows/deploy.yml containing Build job (Maven package with Java 21, JAR artifact upload), Docker job (image build and push to Docker Hub with commit SHA and latest tags), and Deploy job (AWS ECS service update with task definition management). 
- Configured 7 GitHub secrets for authentication (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, ECS_CLUSTER_NAME, ECS_SERVICE_NAME). 
- Fixed task definition name from expensetracker-dev-task to expensetracker-dev and container name from expensetracker to expensetracker-container to match actual ECS configuration. 
- Successfully tested complete deployment pipeline with ~7-12 minute runtime, automatic Docker image versioning, and zero-downtime ECS rolling updates. 
- Pipeline now automatically deploys application to AWS ECS on every push to main branch.
- 
## Current Project Structure:
```
expensetracker/
├── .github/
│   └── workflows/
│       └── deploy.yml                              ⭐ NEW in Step 24
├── Dockerfile                                      
├── .dockerignore                                   
├── docker-compose.yml                              
├── .env.example                                    
├── .env                                            (gitignored)
├── PROGRESS.md
├── README.md
├── pom.xml                                         
├── uploads/                                        (deprecated - now using S3)
├── terraform/                                      
│   ├── main.tf                                     
│   ├── variables.tf                                
│   ├── vpc.tf                                      
│   ├── security-groups.tf                          
│   ├── rds.tf                                      
│   ├── s3.tf                                       
│   ├── iam.tf                                      
│   ├── cloudwatch.tf                               
│   ├── ecs.tf                                      
│   ├── cloudwatch-enhanced.tf                      
│   ├── outputs.tf                                  
│   ├── terraform.tfvars.example                    
│   ├── terraform.tfvars                            (gitignored)
│   ├── .terraform/                                 (gitignored)
│   ├── terraform.tfstate                           (gitignored)
│   ├── terraform.tfstate.backup                    (gitignored)
│   ├── .gitignore                                  
│   └── README.md                                   
└── src/main/
    ├── java/com/harjeet/expensetracker/
    │   ├── ExpensetrackerApplication.java
    │   ├── auth/
    │   │   ├── AuthController.java
    │   │   ├── AuthService.java
    │   │   ├── LoginRequest.java
    │   │   ├── LoginResponse.java
    │   │   └── RegisterRequest.java
    │   ├── config/
    │   │   ├── DataInitializer.java
    │   │   ├── OpenApiConfig.java
    │   │   └── AwsS3Config.java
    │   ├── controller/
    │   │   ├── UserController.java
    │   │   ├── ExpenseController.java
    │   │   ├── CategoryController.java
    │   │   ├── AccountController.java
    │   │   ├── BudgetController.java
    │   │   ├── ReceiptController.java
    │   │   └── ReportController.java
    │   ├── dto/
    │   │   ├── UserDTO.java
    │   │   ├── ExpenseDTO.java
    │   │   ├── CategoryDTO.java
    │   │   ├── AccountDTO.java
    │   │   ├── BudgetDTO.java
    │   │   ├── ReceiptDTO.java
    │   │   ├── ReceiptUploadResponse.java
    │   │   └── ReceiptUrlResponse.java
    │   ├── exception/
    │   │   ├── ResourceNotFoundException.java
    │   │   ├── BadRequestException.java
    │   │   ├── ErrorResponse.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── model/
    │   │   ├── User.java
    │   │   ├── Expense.java
    │   │   ├── Category.java
    │   │   ├── Account.java
    │   │   ├── Budget.java
    │   │   └── Receipt.java
    │   ├── repository/
    │   │   ├── UserRepository.java
    │   │   ├── ExpenseRepository.java
    │   │   ├── CategoryRepository.java
    │   │   ├── AccountRepository.java
    │   │   ├── BudgetRepository.java
    │   │   └── ReceiptRepository.java
    │   ├── security/
    │   │   ├── CustomUserDetailsService.java
    │   │   ├── JwtAuthenticationFilter.java
    │   │   ├── JwtTokenProvider.java
    │   │   └── SecurityConfig.java
    │   └── service/
    │       ├── UserService.java
    │       ├── ExpenseService.java
    │       ├── CategoryService.java
    │       ├── AccountService.java
    │       ├── BudgetService.java
    │       ├── FileStorageService.java            ✅ DEPRECATED (commented @Service)
    │       ├── ReceiptService.java
    │       ├── ReportService.java
    │       └── S3StorageService.java
    └── resources/
        ├── db/
        │   └── migration/
        │       ├── V1__create_users_table.sql
        │       ├── V2__create_categories_table.sql
        │       ├── V3__create_accounts_table.sql
        │       ├── V4__create_expenses_table.sql
        │       ├── V5__create_budgets_table.sql
        │       ├── V6__create_receipts_table.sql
        │       └── V7__alter_receipts_expense_id_nullable.sql
        ├── static/
        │   ├── index.html
        │   ├── login.html
        │   ├── register.html
        │   ├── users.html
        │   ├── expenses.html
        │   ├── categories.html
        │   ├── accounts.html
        │   ├── budgets.html
        │   ├── reports.html
        │   ├── styles.css
        │   └── js/
        │       ├── app.js
        │       ├── auth.js
        │       ├── expenses.js
        │       ├── categories.js
        │       ├── accounts.js
        │       ├── budgets.js
        │       └── reports.js
        ├── application.properties                  
        └── local.properties                        (gitignored)
```