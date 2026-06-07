# agent-pr-quality-reviewer

[![CI](https://github.com/Jai-Gogineni/agent-pr-quality-reviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Jai-Gogineni/agent-pr-quality-reviewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Agent-purple.svg)](https://modelcontextprotocol.io)

> PR quality reviewer — AI-powered code review for test coverage and security

## Architecture

```mermaid
flowchart LR
    A[GitHub PR] --> B[GitHub Client]
    B --> C[Diff Parser]
    C --> D[Coverage Analyzer]
    C --> E[Security Analyzer]
    C --> F[Pattern Analyzer]
    D --> G[Review Report]
    E --> G
    F --> G

    subgraph Analyzers
        D
        E
        F
    end
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Jai-Gogineni/agent-pr-quality-reviewer.git
cd agent-pr-quality-reviewer

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token with repo scope |

## Project Structure

```
src/
├── agent.ts                      # MCP server entry point
├── github-client.ts              # GitHub PR API wrapper
└── analyzers/
    ├── coverage-analyzer.ts      # Test coverage gap detection
    ├── security-analyzer.ts      # Secrets, SQL injection, eval detection
    └── pattern-analyzer.ts       # Architecture pattern violations
```

## Security Checks

| Rule | Severity | Description |
|------|----------|-------------|
| Hardcoded secrets | Critical | API keys, passwords, tokens in source |
| SQL injection | Critical | String concatenation in queries |
| eval() usage | Critical | Dynamic code execution |
| TLS disabled | Critical | Certificate verification bypassed |
| CORS wildcard | Warning | Unrestricted cross-origin access |
| Insecure random | Warning | Math.random() for security operations |

## MCP Tools

| Tool | Description |
|------|-------------|
| `review_pr` | Full PR review with coverage, security, and pattern checks |
| `analyze_diff` | Analyze a raw diff string for quality issues |

## License

MIT © 2024 Jai Gogineni
