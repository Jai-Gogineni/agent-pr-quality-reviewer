# agent-pr-quality-reviewer

[![CI](https://github.com/Jai-Gogineni/agent-pr-quality-reviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Jai-Gogineni/agent-pr-quality-reviewer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

Pull request quality review agent that analyzes code diffs for test coverage gaps, security vulnerabilities, and architecture anti-patterns. Provides actionable feedback with severity scores.

## How It Works

```mermaid
graph LR
    A[PR Diff] --> B[LLM Reviewer]
    B --> C[Security Check]
    B --> D[Coverage Check]
    B --> E[Architecture Check]
    C & D & E --> F[Quality Score]
```

## Quick Start

```bash
git clone https://github.com/Jai-Gogineni/agent-pr-quality-reviewer.git
cd agent-pr-quality-reviewer
npm install
cp .env.example .env  # Add your API keys
npm run build
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | For code analysis |
| `GITHUB_TOKEN` | No | For PR comment posting |

## Example Usage

```typescript
import { PRQualityReviewerAgent } from "./src/agent";

const reviewer = new PRQualityReviewerAgent(process.env.ANTHROPIC_API_KEY!);
const review = await reviewer.reviewDiff(gitDiff);
console.log(`Quality Score: ${review.score}/10`);
console.log(`Issues: ${review.issues.join(", ")}`);
console.log(`Suggestions: ${review.suggestions.join(", ")}`);
```

## Architecture

Built with TypeScript for type safety, uses the Anthropic SDK for LLM capabilities, and follows a single-responsibility pattern where each agent has one clear job. Designed to be composable — agents can be chained together for complex workflows.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Author

**Jai Gogineni** — [jaigogineni.com](https://jaigogineni.com) · [LinkedIn](https://uk.linkedin.com/in/jai-gogineni-9a396654)
