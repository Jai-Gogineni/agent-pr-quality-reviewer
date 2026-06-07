export interface PatternFinding {
  type: "pattern";
  severity: "warning" | "info";
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

interface ArchitectureRule {
  name: string;
  severity: "warning" | "info";
  pattern: RegExp;
  filePattern?: RegExp;
  message: string;
  suggestion: string;
}

export class PatternAnalyzer {
  private rules: ArchitectureRule[] = [
    {
      name: "god_function",
      severity: "warning",
      pattern: /function\s+\w+[^}]{2000,}/s,
      message: "Function appears too long (>50 lines) — consider decomposing",
      suggestion: "Extract helper functions to improve readability and testability",
    },
    {
      name: "any_type",
      severity: "warning",
      pattern: /:\s*any\b|as\s+any\b/,
      filePattern: /\.tsx?$/,
      message: "Usage of 'any' type reduces type safety",
      suggestion: "Use a specific type, generic, or 'unknown' with type guards",
    },
    {
      name: "magic_number",
      severity: "info",
      pattern: /(?:if|while|for|return)\s*\(.*\b(?:[2-9]\d{2,}|\d{4,})\b/,
      message: "Magic number detected in control flow",
      suggestion: "Extract to a named constant for clarity",
    },
    {
      name: "nested_callbacks",
      severity: "warning",
      pattern: /\)\s*=>\s*\{[\s\S]*\)\s*=>\s*\{[\s\S]*\)\s*=>\s*\{/,
      message: "Deeply nested callbacks detected (3+ levels)",
      suggestion: "Refactor using async/await or extract into named functions",
    },
    {
      name: "todo_fixme",
      severity: "info",
      pattern: /\/\/\s*(?:TODO|FIXME|HACK|XXX)\b/i,
      message: "TODO/FIXME comment in new code",
      suggestion: "Create a tracked issue instead of leaving TODO comments",
    },
    {
      name: "console_log",
      severity: "info",
      pattern: /console\.(log|debug|info)\(/,
      message: "console.log in production code",
      suggestion: "Use a structured logger (e.g., pino, winston) instead of console",
    },
  ];

  analyze(diff: string): PatternFinding[] {
    const findings: PatternFinding[] = [];
    const lines = diff.split("\n");

    let currentFile: string | undefined;
    let lineNumber = 0;

    for (const line of lines) {
      const fileMatch = line.match(/^\+\+\+ b\/(.+)/);
      if (fileMatch) {
        currentFile = fileMatch[1];
        lineNumber = 0;
        continue;
      }

      if (line.startsWith("+") && !line.startsWith("+++")) {
        lineNumber++;
        const content = line.slice(1);

        for (const rule of this.rules) {
          if (rule.filePattern && currentFile && !rule.filePattern.test(currentFile)) {
            continue;
          }

          if (rule.pattern.test(content)) {
            findings.push({
              type: "pattern",
              severity: rule.severity,
              file: currentFile,
              line: lineNumber,
              message: rule.message,
              suggestion: rule.suggestion,
            });
          }
        }
      }
    }

    return findings;
  }
}
