# Cloud-Native Expense Tracker

A full-stack expense tracking application built with Java Spring Boot, PostgreSQL, and modern cloud technologies.

## 🚀 Features (In Progress)
- User management
- Expense tracking
- Budget management
- Receipt uploads
- Reporting and analytics
- Cloud deployment (AWS)

## 🛠️ Tech Stack
- **Backend:** Java 21, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, JavaScript
- **Containerization:** Docker
- **Cloud:** AWS (ECS, RDS, S3)
- **IaC:** Terraform
- **CI/CD:** GitHub Actions

## 📋 Prerequisites
- Java 21+
- Docker Desktop
- PostgreSQL
- Maven
- Git

## 🏃‍♂️ Running Locally
```bash
# Clone the repository
git clone <your-repo-url>
cd expensetracker

# Run with Docker (coming in Step 2)
docker-compose up

# Run the Spring Boot application
./mvnw spring-boot:run
```

## 📝 Project Status
Currently on **Step 24** of 25-step roadmap.

See [PROGRESS.md](PROGRESS.md) for detailed progress tracking.

## 🔒 Security Note
The default credentials in `application.properties` are for local development only.
Production deployment uses secure credentials from AWS Secrets Manager (configured in Terraform).

## 🚀 CI/CD Pipeline Active

## 👨‍💻 Author
Harjeet Singh

## 📄 License
MIT License