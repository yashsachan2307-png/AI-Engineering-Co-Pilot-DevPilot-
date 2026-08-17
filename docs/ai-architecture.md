# AI Architecture

DevPilot uses a Retrieval-Augmented Generation (RAG) architecture combined with an Autonomous Agent Loop.

## Why RAG?
Sending an entire repository to an LLM context window is often impossible (exceeding token limits) and usually results in poor performance ("lost in the middle" phenomenon) and high API costs. RAG allows us to search the codebase and selectively feed only the highly relevant files/chunks into the LLM's context.

## The AI Flow
1. **Ingestion & Chunking**: When a repository is imported, the Java codebase is parsed. The chunking mechanism uses AST (Abstract Syntax Tree) to break code down logically (by classes, methods) rather than blindly by character count. This ensures context isn't split mid-function.
2. **Embeddings**: Each chunk is transformed into a vector representation using an embedding model and stored in Postgres via `pgvector`.
3. **Retrieval**: When a user asks a question, the query is embedded, and a cosine similarity search is performed in `pgvector` to find the closest matching code chunks.
4. **Context Construction**: The retrieved chunks are formatted with metadata (file paths, method names, line numbers) and injected into the LLM prompt.

## Engineering Agent & Tool Calling
The system goes beyond basic RAG by utilizing an **Agent Loop**.
- **Tool Calling**: The LLM is provided with definitions of tools (e.g., `SearchCodeTool`, `GetRepositoryStructureTool`). If the initial RAG context isn't enough, the LLM can decide to "call a tool" to fetch more specific files or perform AST queries before responding.
- **Code Review & Generation**: The agent can be instructed to read specific files and output structured diffs (FileProposals).

## Reducing Hallucinations
LLMs frequently hallucinate code that doesn't exist. We mitigate this by:
1. **Deterministic Analysis First**: We don't ask the LLM "what are the dependencies?" We use a deterministic AST parser to find the real dependencies, and then feed those absolute facts to the LLM.
2. **Strict Grounding Prompts**: The LLM is instructed to answer *only* based on the provided context.
3. **Repository References**: Every answer provided by RAG is linked directly to a `RagSourceCitation` (path, line number, exact snippet) so the user can verify the truth.
