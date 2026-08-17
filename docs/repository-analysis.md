# Repository Analysis

## The Ingestion Pipeline
When a repository is imported, it undergoes a multi-stage background process:

1. **Fetching**: The repository tree is fetched using the GitHub API.
2. **Filtering**: Non-code files (images, binaries) and ignored directories (like `node_modules` or `.git`) are filtered out.
3. **AST Parsing**: The raw source code is passed through an Abstract Syntax Tree (AST) parser (e.g., JavaParser). 

## AST Analysis vs AI
Why not just ask the AI to find dependencies or analyze structure?
- LLMs are probabilistic; they guess. 
- AST is deterministic; it proves.

By parsing the AST, DevPilot extracts exact class names, method signatures, variables, and dependencies. This structural data is saved deterministically. When we render an architecture graph, it is 100% accurate because it is based on AST data, not LLM guesses.

## Static Analysis
The static analyzer runs custom rules over the AST to flag issues (e.g., hardcoded credentials, empty catch blocks). 
- **Deterministic + AI**: We use the deterministic analyzer to flag the exact line of the problem. We then hand that specific code block to the AI Engineering Agent to generate the precise fix/diff.
