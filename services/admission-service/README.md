# Express + TypeScript + MikroORM Project

This is a backend service built with Express, TypeScript, and MikroORM with PostgreSQL.

## Project Structure

```
├── src/                  # Source code
│   ├── controllers/      # API controllers
│   ├── database/         # Database related files
│   │   ├── entities/     # MikroORM entities (*.entities.ts)
│   │   └── migrations/   # Database migrations
│   ├── middleware/       # Express middleware
│   ├── v1.ts          # Application entry point
│   └── mikro-orm.config.ts # MikroORM configuration
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)
- PostgreSQL (v12 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Configure the database:
   - Create a PostgreSQL database
   - Update the `.env` file with your database credentials

## Available Scripts

- `pnpm dev`: Start the development server with hot-reload
- `pnpm build`: Build the project for production
- `pnpm start`: Start the production server
- `pnpm migration:intakesCreate`: Create a new migration
- `pnpm migration:up`: Run pending migrations
- `pnpm migration:down`: Revert the last migration
- `pnpm schema:update`: Update the database schema
- `pnpm schema:fresh`: Drop and recreate the database schema

## API Endpoints

- `GET /`: Health check endpoint
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get a user by ID
- `POST /api/users`: Create a new user

## Example Usage

### Create a new user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com"}'
```

### Get all users

```bash
curl http://localhost:3000/api/users
```

### Get a user by ID

```bash
curl http://localhost:3000/api/users/{user_id}
```

## Development

1. Start the development server:
   ```
   pnpm dev
   ```
2. The server will be available at http://localhost:3000

## Database Migrations

To intakesCreate and run migrations:

1. Create a migration:
   ```
   pnpm migration:intakesCreate
   ```
2. Run pending migrations:
   ```
   pnpm migration:up
   ```

## Production Deployment

1. Build the project:
   ```
   pnpm build
   ```
2. Start the production server:
   ```
   pnpm start
   ```