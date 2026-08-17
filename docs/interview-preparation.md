# Interview Preparation

Be prepared to answer these technical questions about DevPilot.

### 1. Overall architecture
"DevPilot is a modular monolith built with a React/Vite frontend and a Spring Boot backend. It uses PostgreSQL with `pgvector` to store both relational data and AI embeddings. The backend integrates with the GitHub API for cloning and the Gemini API for LLM features. Background tasks are handled asynchronously and stream progress to the frontend via SSE."

### 2. Why Spring Boot?
"Spring Boot provides an enterprise-grade structure out of the box. The dependency injection, built-in security features, and excellent support for asynchronous processing (`@Async`) made it ideal for building a robust backend that handles both standard REST traffic and heavy background parsing jobs."

### 3. Why PostgreSQL?
"Postgres is rock-solid and ACID compliant. By using it, we get robust relational data management while avoiding the complexity of a NoSQL database."

### 4. Why pgvector?
"Instead of adding a separate vector database like Pinecone, `pgvector` allows us to store our embedded code chunks right next to our relational data. This simplifies our deployment architecture, makes backups easier, and allows us to perform standard SQL joins against vector similarity search results."

### 5. Why RAG?
"Sending an entire repository into an LLM's context window is often impossible due to token limits, and even when possible, it degrades the LLM's reasoning quality ('lost in the middle'). RAG allows us to search for only the most relevant code chunks and feed them to the LLM, lowering API costs and drastically improving accuracy."

### 6. Why not send the whole repository to the LLM?
"Token limits, high latency, massive API costs, and degraded accuracy. LLMs perform better when given focused, highly relevant context."

### 7. How does chunking work?
"Instead of randomly splitting code by character count (which breaks methods in half), we use an Abstract Syntax Tree (AST) parser to chunk the code logically—by classes and methods. This ensures the LLM receives complete, readable semantic blocks."

### 8. How do embeddings work?
"We pass the raw text of each code chunk to an embedding model, which returns a dense vector array (e.g., 768 dimensions). This vector represents the semantic meaning of the code. We store it in Postgres."

### 9. How does retrieval work?
"When a user asks a question, we embed their question into a vector. We then use `pgvector` to perform a cosine similarity search across our database, returning the chunks whose vectors are closest to the question's vector."

### 10. How does the agent select tools?
"We provide the LLM with a list of available tools (like `SearchCodeTool` or `GetArchitectureTool`) in a JSON schema format. The LLM decides if it needs more information to answer the prompt and returns a structured 'tool call' response. Our backend executes the tool and returns the result back to the LLM to continue reasoning."

### 11. Why use AST parsing?
"AST (Abstract Syntax Tree) gives us a deterministic understanding of the code. We can extract exact method signatures, class names, and dependencies without relying on regex or LLM guesses."

### 12. Why deterministic analysis + AI?
"LLMs hallucinate. By combining deterministic AST analysis (which proves facts about the code) with AI reasoning, we ground the AI. We don't ask the AI 'what are the dependencies?', we ask the AST parser, and then hand those facts to the AI."

### 13. How do you prevent hallucinations?
"By using strict RAG prompts that command the LLM to only use the provided context, feeding it deterministic AST data, and providing users with direct source citations (file paths and line numbers) for every claim the AI makes."

### 14. How does GitHub OAuth work?
"The user is redirected to GitHub to authorize DevPilot. GitHub redirects back with a code, which our backend exchanges for an Access Token. We use this token to fetch their repositories and read their code on their behalf."

### 15. How does JWT authentication work?
"After successful login/OAuth, our backend signs a JWT with a secret key and sends it to the frontend. The frontend stores it and attaches it to the `Authorization` header of subsequent requests. The backend verifies the signature statelessly without querying the database for a session."

### 16. How does asynchronous repository analysis work?
"When an import is requested, the controller returns immediately. A background thread (via `@Async`) takes over to clone the repo, parse the AST, generate embeddings, and save chunks. This prevents HTTP timeouts."

### 17. Why SSE?
"Server-Sent Events are unidirectional (Server -> Client). Since the frontend only needs to listen to ingestion progress updates and doesn't need to send high-frequency messages back, SSE is much simpler and more resilient than full two-way WebSockets."

### 18. Why is Redis optional?
"We use it to cache external API calls (like GitHub tree fetching) to prevent rate limits. However, the core app functions without it, keeping the deployment architecture lightweight if needed."

### 19. How would you scale the system?
"I would break the monolithic Spring Boot app into two: an API Gateway/Core service and a dedicated Ingestion Worker service. I would use a message broker like RabbitMQ or Kafka to queue ingestion jobs, allowing us to spin up multiple worker nodes to process repositories in parallel."

### 20. What happens when the LLM API fails?
"The backend catches the exception, logs the error, and gracefully returns a clear error message to the frontend, indicating that AI features are temporarily unavailable, while the deterministic features (AST graphs) remain fully functional."

### 21. What happens with a huge repository?
"Ingestion takes longer. We handle this via async processing. However, if it's too large, we might hit API rate limits or run out of memory during AST parsing. A future improvement would be implementing batching/pagination during the ingestion phase."

### 22. How do you protect repository data?
"We don't store plain text GitHub tokens; they are AES-256 encrypted. Repositories are scoped strictly to the authenticated user ID."

### 23. How would you improve the system in the future?
"I'd add a message broker for robust job queuing, support for more languages in the AST parser (like Python/TypeScript), and integrate a more advanced vector indexing algorithm (like HNSW) in Postgres for faster retrieval."
