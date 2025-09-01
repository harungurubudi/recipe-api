# Recipe API

A RESTful API built with [NestJS](https://nestjs.com/) for managing recipes.
This project was developed as part of the Givery recruitment assignment.

## Features
- Create, read, update, and delete recipes
- Input validation and error handling
- MySQL database integration
- Clean architecture with NestJS modules, services, and controllers

## Development
To start in development environment, please run this step
1. Clone this repository 
   ```
   git clone git@github.com:harungurubudi/recipe-api.git
   cd recipe-api
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Run [Docker Compose - Development Setup](#development-setup)
4. Run the application
   ```
   npm run start:dev
   ```
   The migration will start on first run automatically.

## Docker Compose Setup

### Development Setup

This steps run Docker Compose for local development environment. It runs container for mysql only.

1. Copy `.env.example` to `.env` and update the variables if needed.
2. Start the database container:
   ```bash
   docker-compose --profile development up -d
   ```
3. Stop containers:
   ```bash
   docker-compose stop
   ```

### Application Setup

This steps run Docker Compose for full deployment. It runs :
- run container for mysql
- build app image based on the Dockerfile and run container for it

1. Copy `.env.docker` to `.env` and update the variables if needed.
2. Start the database container:
   ```bash
   docker-compose --profile app up -d --build   
   ```
3. Stop containers:
   ```bash
   docker-compose stop
   ```

## Usage

Once the server is running, the API will be available at:

```
http://localhost:3000
```

Available endpoints:

- POST /recipes
- GET /recipes
- GET /recipes/:id
- PATCH /recipes/:id
- DELETE /recipes/:id

## Project Structure & Domain-Driven Design

This project follows Domain-Driven Design (DDD) principles to separate concerns and keep the core business logic independent from infrastructure and frameworks.

```
recipe-api/
└─ src/
   ├─ adapter/
   │  ├─ database/     # Database connection, migrations, infrastructure adapters
   │  └─ config/       # Configuration module and environment management
   └─ recipes/
      ├─ domain/
      │  └─ recipe.entity.ts      # Domain entity, pure business logic, DB-agnostic
      ├─ dto/
      │  └─ recipe.dto.ts         # Data Transfer Objects for input/output validation
      ├─ repositories/
      │  ├─ entities/             # Database-specific entity mapping (TypeORM)
      │  └─ recipe.repository.ts  # Handles database queries, separates persistence logic
      ├─ recipes.controller.ts    # RESTful endpoints, handles requests/responses
      ├─ recipes.module.ts        # NestJS module definition
      └─ recipes.service.ts       # Application layer: implements business use cases
```

### Layer Overview

1. **Domain Layer**
   - Contains pure domain entities (recipe.entity.ts)
   - Independent from NestJS, TypeORM, or any database
   - Focused on business rules and core attributes

2. **DTO Layer**
   - Validates input/output data for controllers and services
   - Keeps domain layer clean and framework-independent

3. **Repository Layer**
   - Interfaces with the database via recipe.repository.ts
   - Translates between domain entities and persistence layer
   - Keeps database logic out of the service layer

4. **Application Layer (Service & Controller)**
   - **Service**: Implements business use cases, calls repositories
   - **Controller**: Handles HTTP requests, calls service, returns responses
   - No SQL or database logic here

5. **Adapter / Config Layer**
   - Infrastructure: database connections, environment variables, configs
   - Implements **adapter pattern** to keep domain pure and testable

---

**Benefits**
- Clear **separation of concerns**
- Fully **testable** domain logic without requiring a database
- Easy to **extend and maintain** for future features
- Makes the project structure **reviewer-friendly** for recruitment assessment

## Test

This project includes both **unit tests** and **integration tests**.

- Unit tests cover isolated modules and services.
- Integration tests run against an in-memory **SQLite** database (no external setup required).

### Run all tests
```bash
npm run test
```

### Run in verbose mode
```bash
npm run test:verbose
```

### Run with coverage
```bash
npm run test:cov
```