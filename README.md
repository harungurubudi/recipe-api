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
3. Configure database. Copy the ``.env.example`` to ``.env``. You can adjust with your own configuration if needed. 
4. Run the application
   ```
   npm run start:dev
   ```
   The migration will start on first run automatically.

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