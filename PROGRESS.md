# Cloud-Native Expense Tracker - Progress Tracker


**GitHub Repository:** https://github.com/iamharjeet/expensetracker

## Completed Steps
- [x] Step 1: Project Setup & GitHub Repository ✅
- [x] Step 2: Simple Database & Docker Setup ✅
- [x] Step 3: Basic REST API - User CRUD ✅
- [x] Step 4: Simple Frontend - Part 1 (Structure & Users) ✅
- [ ] Step 5: Second Entity - Expenses (Simplified)
- [ ] Step 6: Add Basic Security (Simple JWT)
- [ ] Step 7: Enhance Data Model - Categories & Accounts
- [ ] Step 8: User Registration & Profile
- [ ] Step 9: Budget Management (Basic)
- [ ] Step 10: Improve Frontend - Dashboard & Charts
- [ ] Step 11: Database Migrations & Refactoring
- [ ] Step 12: File Upload - Receipts (Local First)
- [ ] Step 13: Reporting & Export
- [ ] Step 14: Email Notifications (Simple SMTP First)
- [ ] Step 15: AWS S3 Integration (Replace Local Storage)
- [ ] Step 16: Dockerize the Application
- [ ] Step 17: Environment Configuration & Profiles
- [ ] Step 18: Terraform - Basic Infrastructure
- [ ] Step 19: Terraform - ECS Deployment
- [ ] Step 20: CI/CD Pipeline & Final Polish

## Current Step: 4

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

## Current Project Structure:
```
expensetracker/
├── docker-compose.yml
├── PROGRESS.md
├── README.md
├── pom.xml
└── src/main/
    ├── java/com/harjeet/expensetracker/
    │   ├── ExpensetrackerApplication.java
    │   ├── controller/
    │   │   └── UserController.java
    │   ├── dto/
    │   │   └── UserDTO.java
    │   ├── model/
    │   │   └── User.java
    │   ├── repository/
    │   │   └── UserRepository.java
    │   └── service/
    │       └── UserService.java
    └── resources/
        ├── static/
        │   ├── index.html          ✅ NEW
        │   ├── users.html          ✅ NEW
        │   ├── styles.css          ✅ NEW
        │   └── js/
        │       └── app.js          ✅ NEW
        └── application.properties
```