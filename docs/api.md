# REST API

DevPilot uses a standard RESTful JSON API built on Spring Boot.

## Core Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate with credentials and receive a JWT.
- `POST /api/auth/signup` - Register a new user.
- `GET /api/auth/github` - Initiate GitHub OAuth flow.

### Repositories
- `GET /api/repositories` - List imported repositories.
- `POST /api/repositories/import` - Queue a repository for cloning and ingestion.
- `GET /api/repositories/{id}` - Get repository metadata.
- `GET /api/repositories/{id}/architecture` - Retrieve AST-based architecture graph (nodes and edges).
- `GET /api/repositories/{id}/security` - Retrieve static analysis security findings.

### AI & Agent
- `POST /api/repositories/{id}/conversations` - Create a new AI agent conversation.
- `GET /api/conversations/{id}/messages` - Fetch chat history.
- `POST /api/conversations/{id}/messages` - Send a message to the agent and trigger tool calling/RAG.

## Server-Sent Events (SSE)
- `GET /api/repositories/{id}/status/stream` 
  Used by the frontend to listen to real-time ingestion events. The server emits events like `CLONING`, `PARSING_AST`, `CHUNKING`, `EMBEDDING`, `COMPLETED`, allowing the React UI to display a live progress bar.

## Health
- `GET /actuator/health` - Exposed for Docker/Kubernetes readiness and liveness probes.
