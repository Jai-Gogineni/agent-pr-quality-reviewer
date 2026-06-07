import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CoverageAnalyzer } from "./analyzers/coverage-analyzer.js";
import { SecurityAnalyzer } from "./analyzers/security-analyzer.js";
import { PatternAnalyzer } from "./analyzers/pattern-analyzer.js";
import { GitHubClient } from "./github-client.js";

const server = new Server(
  { name: "agent-pr-quality-reviewer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "review_pr",
      description: "Review a GitHub PR for quality issues including coverage gaps, security concerns, and pattern violations",
      inputSchema: {
        type: "object" as const,
        properties: {
          owner: { type: "string", description: "Repository owner" },
          repo: { type: "string", description: "Repository name" },
          prNumber: { type: "number", description: "Pull request number" },
          checks: {
            type: "array",
            items: { type: "string", enum: ["coverage", "security", "patterns"] },
            description: "Which checks to run (default: all)",
          },
        },
        required: ["owner", "repo", "prNumber"],
      },
    },
    {
      name: "analyze_diff",
      description: "Analyze a raw diff string for quality issues",
      inputSchema: {
        type: "object" as const,
        properties: {
          diff: { type: "string", description: "Raw unified diff content" },
          checks: {
            type: "array",
            items: { type: "string", enum: ["coverage", "security", "patterns"] },
          },
        },
        required: ["diff"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "review_pr": {
      const owner = args?.owner as string;
      const repo = args?.repo as string;
      const prNumber = args?.prNumber as number;
      const checks = (args?.checks as string[]) ?? ["coverage", "security", "patterns"];

      const client = new GitHubClient(process.env.GITHUB_TOKEN ?? "");
      const diff = await client.getPRDiff(owner, repo, prNumber);
      const prInfo = await client.getPRInfo(owner, repo, prNumber);

      const findings = await runChecks(diff, checks);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            pr: { title: prInfo.title, author: prInfo.author, filesChanged: prInfo.filesChanged },
            findings,
            summary: {
              total: findings.length,
              critical: findings.filter((f) => f.severity === "critical").length,
              warning: findings.filter((f) => f.severity === "warning").length,
              info: findings.filter((f) => f.severity === "info").length,
            },
          }, null, 2),
        }],
      };
    }

    case "analyze_diff": {
      const diff = args?.diff as string;
      const checks = (args?.checks as string[]) ?? ["coverage", "security", "patterns"];
      const findings = await runChecks(diff, checks);
      return { content: [{ type: "text", text: JSON.stringify(findings, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

interface Finding {
  type: string;
  severity: "critical" | "warning" | "info";
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

async function runChecks(diff: string, checks: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];

  if (checks.includes("coverage")) {
    const coverageAnalyzer = new CoverageAnalyzer();
    findings.push(...coverageAnalyzer.analyze(diff));
  }

  if (checks.includes("security")) {
    const securityAnalyzer = new SecurityAnalyzer();
    findings.push(...securityAnalyzer.analyze(diff));
  }

  if (checks.includes("patterns")) {
    const patternAnalyzer = new PatternAnalyzer();
    findings.push(...patternAnalyzer.analyze(diff));
  }

  return findings;
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agent PR Quality Reviewer MCP server running on stdio");
}

main().catch(console.error);
