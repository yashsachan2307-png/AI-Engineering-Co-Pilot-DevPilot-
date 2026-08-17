# Limitations

DevPilot is a powerful portfolio and development tool, but it has honest architectural limitations that must be acknowledged before any production usage.

## 1. Supported Languages
- The **AST Parser** currently only fully supports **Java**. It can perform basic regex chunking on other languages, but deep architectural graphs and static analysis rules are strictly limited to Java codebases.
- Extending this requires integrating parsers for TypeScript, Python, etc.

## 2. Repository Size
- Very large repositories (e.g., Linux kernel, massive monorepos) will take significant time to clone, parse, and embed.
- Postgres `pgvector` indexing becomes slower as row counts exceed millions of chunks. We do not currently use HNSW indexing optimizations, so similarity searches on giant codebases may experience latency.

## 3. AI Hallucinations
- Despite strict RAG grounding, the LLM may occasionally hallucinate method names or invent APIs that do not exist in the codebase.
- We mitigate this by showing source citations, but human verification of generated code is always required.

## 4. Security Analysis
- The static security analyzer is rudimentary. It relies on basic AST pattern matching.
- It **does not** replace enterprise tools like SonarQube, Snyk, or Veracode. It is designed to demonstrate how deterministic analysis feeds into AI agent workflows, not to guarantee codebase security.

## 5. Third-Party Dependencies
- **GitHub API Limits**: Fetching trees and files heavily utilizes the GitHub REST API. Unauthenticated requests will hit rate limits extremely quickly.
- **LLM API**: The system entirely depends on the Gemini API. If the API is down or rate-limited, the Agent features will fail gracefully but become unusable.
