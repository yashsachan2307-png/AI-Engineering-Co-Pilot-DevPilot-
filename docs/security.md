# Security

## Authentication Flow
DevPilot uses a modern stateless authentication flow:
1. **GitHub OAuth**: Users authenticate via GitHub. This prevents us from having to manage passwords and natively grants us an access token to read their repositories.
2. **JWT (JSON Web Tokens)**: Once authenticated, the Spring Boot backend issues a JWT. The React frontend stores this and attaches it as a `Bearer` token to the `Authorization` header of subsequent API requests.

## Data Protection
- **Encryption at Rest**: Sensitive tokens (like the user's GitHub Personal Access Token) are encrypted using AES-256 before being stored in PostgreSQL. They are only decrypted in memory when an API call to GitHub is strictly necessary.
- **Environment Isolation**: Production environments require the `ENCRYPTION_KEY` and `JWT_SECRET` to be provided via environment variables, ensuring secrets never leak into the codebase.

## Security Analysis Capabilities
DevPilot includes a static security analyzer that scans the AST for:
- Hardcoded secrets and passwords.
- Insecure crypto implementations.
- Broad exception catching (which can mask security failures).

*Note: DevPilot's security analysis is a supplementary tool and does not replace dedicated SAST/DAST enterprise scanners.*
