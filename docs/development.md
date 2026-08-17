# Development Guide

## Local Setup

### Prerequisites
- Java 17
- Node.js 20+
- Docker & Docker Compose (for database/redis)

### 1. Database Start
Bring up PostgreSQL with pgvector and Redis using Docker:
```bash
docker-compose up db redis -d
```

### 2. Backend (Spring Boot)
Open the `backend` folder in IntelliJ IDEA or use Maven:
```bash
cd backend
mvn spring-boot:run
```
*Note: Ensure you have copied `.env.example` to `.env` and sourced it, or configured the environment variables in your IDE run configuration.*

### 3. Frontend (React + Vite)
In the root directory:
```bash
npm install
npm run dev
```

## Running Tests
- **Backend**: `cd backend && mvn test`
- **Frontend**: `npm run test`

## Dependency Management
- **Java**: Handled via `pom.xml`. Update dependencies there and reload the Maven project.
- **Node**: Handled via `package.json`. Run `npm install <package>` to add new dependencies.

## Architecture Notes for Developers
- Keep the modular monolith clean. Do not tightly couple the `rag` package with the `auth` package.
- When creating new AI Tools, implement the `AgentTool` interface and register it in the Spring context.
