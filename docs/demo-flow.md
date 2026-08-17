# Demo Flow

Use this script to present DevPilot in a 5-10 minute window. Ensure you have a target Java repository ready (e.g., a simple Spring Boot app or DevPilot itself).

## 1. Authentication
- Open the login page.
- Click **"Connect with GitHub"** to demonstrate OAuth integration.
- Mention: *"We use OAuth so we don't handle passwords, and we use JWTs for stateless session management."*

## 2. Repository Selection & Import
- On the dashboard, click **"Import Repository"**.
- Select the target repository from the dropdown.
- Click Import. 
- **Observe the Progress Bar**: Mention: *"The backend is processing this asynchronously. It's cloning the repo, running the AST parser, chunking the code, and generating vector embeddings using the Gemini API. The progress is streamed back to the UI in real-time using Server-Sent Events (SSE)."*

## 3. Architecture & Intelligence
- Once imported, click on the repository to view details.
- Show the **Architecture Graph**. Mention: *"This isn't an AI guess. This is generated deterministically using our AST parser to find actual class dependencies."*
- Show the **Security Findings** tab. Mention: *"Our static analyzer found these issues directly from the AST."*

## 4. AI Agent & RAG
- Open the Chat / Engineering Agent interface.
- **Ask a general question**: *"Where is the database configuration located?"*
  - Show the response. 
  - Point out the **Source Citations**. Mention: *"We use RAG. We embedded the question, searched pgvector, and fed the relevant chunks to the LLM. It gives us exact file paths and line numbers, preventing hallucinations."*
- **Ask a debugging question**: *"I'm getting a NullPointerException in the Auth flow. What could be causing it?"*
  - Watch the Agent decide to use a Tool. Mention: *"The Agent realized it needs more context, so it dynamically called a search tool on our backend to find the exact auth files before answering."*

## 5. Code Generation / Proposal
- **Command the AI**: *"Propose a refactoring to add a try-catch block around the database save method in `UserService.java`."*
- Show the generated diff / FileProposal.
- Conclude: *"DevPilot combines the deterministic truth of AST parsing with the reasoning power of an AI agent to help engineers understand and modify code safely."*
