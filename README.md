# Recipe API

A RESTful API built with [NestJS](https://nestjs.com/) for managing recipes.
This project was developed as part of the Givery recruitment assignment.

### Features
- Create, read, update, and delete recipes
- Input validation and error handling
- MySQL database integration
- Clean architecture with NestJS modules, services, and controllers

### Installation
1. Clone this repository 
   ```
   git clone git@github.com:harungurubudi/recipe-api.git
   cd recipe-api
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Run [Docker Compose setup](#docker-compose-setup)
4. Run the application
   ```
   npm run start:dev
   ```
   The migration will start on first run automatically.

### Docker Compose Setup

This project uses Docker Compose to run PostgreSQL for local development.

1. Copy `.env.example` to `.env` and update the variables if needed.
2. Start the database container:
   ```bash
   docker-compose up -d
   ```
3. Stop containers:
   ```bash
   docker-compose down
   ```

### Usage

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