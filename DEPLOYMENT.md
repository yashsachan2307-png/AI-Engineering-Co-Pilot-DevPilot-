# DevPilot Lightweight Deployment (Phase 19)

This document provides instructions on how to build, run, and deploy the DevPilot application locally and in simple production environments using Docker and Docker Compose.

## Architecture Overview

DevPilot uses a lightweight, straightforward deployment architecture with no need for Kubernetes or complex microservices.

```text
       [ User Browser ]
              |
              v (Port 5173 / 80)
    +-------------------+
    | Frontend (React)  |  --- Nginx serving static files
    +-------------------+
              |
              v (Port 8080)
    +-------------------+       +-----------------------+
    | Backend API       | ----> | External AI APIs      |
    | (Spring Boot)     |       | (Gemini / GitHub API) |
    +-------------------+       +-----------------------+
              |
              v (Port 5432)
    +-------------------+
    | PostgreSQL DB     |  --- (Includes pgvector)
    +-------------------+
```

## Services
1. **Frontend**: React SPA built with Vite. Hosted using an Nginx alpine container.
2. **Backend**: Spring Boot API running on OpenJDK 17.
3. **Database**: PostgreSQL with `pgvector` extension for vector embeddings.
4. **Redis** *(Optional)*: Caching layer.

---

## 1. Local Setup

### Environment Variables
Copy the example environment file and fill in your secrets.
```bash
cp .env.example .env
```
Ensure you provide the valid keys for:
- `AI_API_KEY` (Gemini API)
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

**IMPORTANT**: Never commit `.env` files to version control.

---

## 2. Docker Setup

To start the entire stack locally, simply run:

```bash
docker-compose up --build
```

This command will:
1. Start the PostgreSQL + pgvector database (`db`) on port `5432`.
2. Start the Redis cache (`redis`) on port `6379`.
3. Build and start the Spring Boot API (`backend`) on port `8080`.
4. Build and start the React app (`frontend`) on port `5173`.

### Accessing the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Backend Health Check**: http://localhost:8080/actuator/health

---

## 3. Database Setup
The `docker-compose.yml` automatically initializes the `devpilot` database and mounts a volume (`db-data`) to persist the data between container restarts. Spring Boot is configured to auto-update the database schema (`spring.jpa.hibernate.ddl-auto=update`).

---

## 4. Deployment Steps

When deploying to a production server (e.g., AWS EC2, DigitalOcean Droplet, Linux VPS):

1. **Install Prerequisites**: Ensure `docker` and `docker-compose` are installed on the host machine.
2. **Clone Repository**: Clone the DevPilot repository to the server.
3. **Configure Environment**: Create a `.env` file with production values (strong DB passwords, secure JWT secrets).
4. **Build and Run**: Execute `docker-compose up -d --build`. This runs the containers in the background.

*Note: In production, consider placing a reverse proxy (like an additional Nginx instance or Caddy) in front of the application to handle SSL/TLS termination and route traffic from ports 80/443 to the respective containers.*

---

## 5. Troubleshooting

- **Backend fails to connect to database**: Ensure the DB container is healthy. The backend uses `depends_on: condition: service_healthy` to wait for Postgres, but if it times out, check the DB logs: `docker logs devpilot-db`.
- **Frontend API calls fail**: Check if `VITE_API_URL` is pointing to the correct backend host/port. By default, it's `http://localhost:8080`. If you deploy on a server with an IP, change it to that IP or domain.
- **Port Conflicts**: If port 8080 or 5432 is already in use on your host machine, modify the port bindings in `docker-compose.yml` (e.g., `"8081:8080"`).
- **Health Check Failing**: You can test the backend health manually by running `curl http://localhost:8080/actuator/health`. Ensure `SecurityConfig` permits access to this path.
