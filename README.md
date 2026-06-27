# NestJS Starter

Production-ready template for building scalable backend APIs with NestJS, TypeScript, Prisma ORM, JWT Authentication, and PostgreSQL.

## 🎯 Overview

**NestJS Starter** is a comprehensive backend template that implements enterprise-grade architecture and best practices:
- **Framework**: NestJS 10.x with layered architecture (Repository → Service → Controller)
- **Language**: TypeScript for type safety and enhanced developer experience
- **Database**: Prisma ORM + PostgreSQL for robust data management
- **Authentication**: JWT + Passport for secure API endpoints
- **Validation**: class-validator + class-transformer for input validation
- **Documentation**: Swagger UI for interactive API documentation
- **Testing**: Jest + Supertest for comprehensive test coverage

Use this starter for:
- Production-ready REST API backends
- Microservices architecture foundation
- Teams wanting NestJS best practices built-in

---

## 📚 Tech Stack

| Concern | Package |
|---------|---------|
| Framework | NestJS 10.x |
| Language | TypeScript |
| ORM | Prisma |
| Database Driver | PostgreSQL (pg) |
| Authentication | JWT + @nestjs/passport + passport-jwt |
| Validation | class-validator + class-transformer |
| API Documentation | @nestjs/swagger |
| Testing | Jest + Supertest |
| Node Version | v20+ |

---

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10+ or yarn/pnpm
- **PostgreSQL**: v12+ (local or cloud)
- **Docker**: for running PostgreSQL locally (optional)
- **Git**: for version control

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd nest-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Copy environment example file:

```bash
cp .env.example .env
```

The `.env` file is ready for local development without requiring modifications.

### 4. Run Database (with Docker)

```bash
docker-compose up -d
```

If not using Docker, ensure PostgreSQL is running and update `DATABASE_URL` in `.env`.

### 5. Run Database Migrations

```bash
npm run db:migrate
```

---

## 💻 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot-reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run unit & integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint & fix issues |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema without migration (prototyping) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

### 6. Start Development Server

After running migrations, start the development server:

```bash
npm run start:dev
```

The application will run at:
- **API Base**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

---

## 📁 Project Structure

```
src/
├── features/
│   ├── auth/                      # Authentication module
│   │   ├── controllers/           # Auth endpoints
│   │   ├── dto/                   # Request/Response DTOs
│   │   ├── entities/              # Auth entity
│   │   ├── repositories/          # Data access layer
│   │   ├── services/              # Business logic
│   │   ├── strategies/            # JWT Passport strategy
│   │   └── auth.module.ts
│   └── users/                     # User management module
│       ├── controllers/           # User CRUD endpoints
│       ├── dto/                   # User DTOs
│       ├── entities/              # User entity
│       ├── repositories/          # Data access layer
│       ├── services/              # Business logic
│       └── users.module.ts
├── shared/
│   ├── prisma/                    # Prisma service singleton
│   ├── guards/                    # JwtAuthGuard & other guards
│   ├── decorators/                # @CurrentUser() & custom decorators
│   ├── filters/                   # Global exception filters
│   ├── interceptors/              # Response transform interceptor
│   └── utils/                     # Helper functions
└── app.module.ts                  # Root module
```

---

## 📚 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new account |
| POST | `/api/v1/auth/login` | Login & get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |

### Users (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create new user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

---

## 🏗️ Architecture Guide

Complete documentation for architecture, naming conventions, and best practices is available in [CODE.md](./CODE.md).

**Key Topics:**
- Naming conventions (functions, files, folders)
- Layer structure (Controllers → Services → Repositories)
- NestJS module organization
- Prisma ORM patterns
- JWT authentication flow
- Global exception handling
- Response format standardization
- Test patterns (unit, integration, e2e)

---

## 🔒 Response Format

All responses are wrapped by `TransformInterceptor`:

**Success Response:**
```json
{
  "status": "success",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users"
}
```

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

Developed by Dzikri Alan's Team
