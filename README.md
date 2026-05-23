# DevPulse

## Live Deployment
- Live URL: **TBD**

> Add the public live URL here once the backend is deployed.

## Project Overview
DevPulse is an internal issue and feature tracker built with Node.js, Express, TypeScript, and PostgreSQL. The API supports user authentication, role-based authorization, issue creation, retrieval, updates, and deletion.

## Features
- User registration and login with JWT authentication
- Role-based permissions for `contributor` and `maintainer`
- Create bug reports and feature requests
- Retrieve all issues with optional filtering and sorting
- Retrieve a single issue by ID
- Update issue fields (contributors can update own open issues; maintainers can update any issue)
- Delete issues (maintainer only)

## Tech Stack
- Node.js (latest LTS)
- TypeScript
- Express.js
- PostgreSQL via native `pg` driver
- bcrypt for password hashing
- jsonwebtoken for JWT authentication
- cors for cross-origin support
- dotenv for environment configuration

## Setup
1. Clone the repository
   ```bash
   git clone <repo-url>
   cd Assignment-2
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```env
   PORT=4000
   DB_URL=postgres://<user>:<password>@<host>:<port>/<database>
   JWT_ACCESS_SECRET=your_jwt_secret
   JWT_TOKEN_TIME=1h
   ```
4. Start the app in development mode
   ```bash
   npm run dev
   ```
5. Build for production
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication

#### Register a user
- Method: `POST`
- URL: `/api/auth/signup`
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "role": "contributor"
  }
  ```
- Success response: `201 Created`
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
  ```

#### Login
- Method: `POST`
- URL: `/api/auth/login`
- Request body:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }
  ```
- Success response: `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "<JWT_TOKEN>",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "contributor",
        "created_at": "2026-01-20T09:00:00Z",
        "updated_at": "2026-01-20T09:00:00Z"
      }
    }
  }
  ```

### Issues

#### Create issue
- Method: `POST`
- URL: `/api/issues`
- Headers: `Authorization: <JWT_TOKEN>`
- Request body:
  ```json
  {
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug"
  }
  ```
- Success response: `201 Created`
  ```json
  {
    "success": true,
    "message": "Issue created successfully",
    "data": {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter_id": 1,
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    }
  }
  ```

#### Get all issues
- Method: `GET`
- URL: `/api/issues`
- Optional query params:
  - `sort=newest|oldest`
  - `type=bug|feature_request`
  - `status=open|in_progress|resolved`
- Success response: `200 OK`
  ```json
  {
    "success": true,
    "message": "Issue retrieved successfully",
    "data": [
      {
        "id": 45,
        "title": "Database connection timeout under load",
        "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
        "type": "bug",
        "status": "open",
        "reporter": {
          "id": 1,
          "name": "John Doe",
          "role": "contributor"
        },
        "created_at": "2026-01-20T10:30:00Z",
        "updated_at": "2026-01-20T14:45:00Z"
      }
    ]
  }
  ```

#### Get single issue
- Method: `GET`
- URL: `/api/issues/:id`
- Success response: `200 OK`
  ```json
  {
    "success": true,
    "message": "Issue retrieved successfully",
    "data": {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  }
  ```

#### Update issue
- Method: `PATCH`
- URL: `/api/issues/:id`
- Headers: `Authorization: <JWT_TOKEN>`
- Request body:
  ```json
  {
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug"
  }
  ```
- Success response: `200 OK`
  ```json
  {
    "success": true,
    "message": "Issue updated successfully",
    "data": {
      "id": 45,
      "title": "Updated: Database pool exhaustion fix needed",
      "description": "Updated description with reproduction steps...",
      "type": "bug",
      "status": "in_progress",
      "reporter_id": 1,
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  }
  ```

#### Delete issue
- Method: `DELETE`
- URL: `/api/issues/:id`
- Headers: `Authorization: <JWT_TOKEN>`
- Success response: `200 OK`
  ```json
  {
    "success": true,
    "message": "Issue deleted successfully"
  }
  ```

## Database Schema

### `users`
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(30) NOT NULL
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password`: TEXT NOT NULL
- `role`: VARCHAR(11) DEFAULT 'contributor' CHECK(role IN ('contributor','maintainer'))
- `created_at`: TIMESTAMP DEFAULT NOW()
- `updated_at`: TIMESTAMP DEFAULT NOW()

### `issues`
- `id`: SERIAL PRIMARY KEY
- `title`: VARCHAR(150) NOT NULL
- `description`: TEXT NOT NULL CHECK(length(description) >= 20)
- `type`: VARCHAR(20) NOT NULL CHECK(type IN ('bug','feature_request'))
- `status`: VARCHAR(12) DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved'))
- `reporter_id`: INT NOT NULL
- `created_at`: TIMESTAMP DEFAULT NOW()
- `updated_at`: TIMESTAMP DEFAULT NOW()

## Notes
- Contributors can create issues and update their own open issues.
- Maintainers can update or delete any issue.
- JWT token must be sent in the `Authorization` header for protected routes.

## Run Commands
- `npm run dev` — start in development mode
- `npm run build` — compile TypeScript
