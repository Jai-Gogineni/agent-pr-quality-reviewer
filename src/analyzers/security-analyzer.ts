export interface SecurityFinding {
  type: "security";
  severity: "critical" | "warning";
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

interface SecurityRule {
  name: string;
  severity: "critical" | "warning";
  pattern: RegExp;
  message: string;
  suggestion: string;
}

export class SecurityAnalyzer {
  private rules: SecurityRule[] = [
    {
      name: "hardcoded_secret",
      severity: "critical",
      pattern: /(?:api[_-]?key|secret|password|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      message: "Potential hardcoded secret detected",
      suggestion: "Use environment variables or a secrets manager instead of hardcoding credentials",
    },
    {
      name: "sql_injection",
      severity: "critical",
      pattern: /(?:query|execute|raw)\s*\(\s*[`'"].*\$\{|(?:query|execute|raw)\s*\(\s*.*\+\s*(?:req|request|params|query)/i,
      message: "Potential SQL injection vulnerability — string concatenation in query",
      suggestion: "Use parameterized queries or prepared statements",
    },
    {
      name: "eval_usage",
      severity: "critical",
      pattern: /\beval\s*\(|new\s+Function\s*\(/,
      message: "Use of eval() or Function constructor detected",
      suggestion: "Avoid eval() — use safer alternatives like JSON.parse or structured data handling",
    },
    {
      name: "insecure_random",
      severity: "warning",
      pattern: /Math\.random\(\)/,
      message: "Math.random() used — not cryptographically secure",
      suggestion: "Use crypto.randomUUID() or crypto.getRandomValues() for security-sensitive operations",
    },
    {
      name: "cors_wildcard",
      severity: "warning",
      pattern: /(?:Access-Control-Allow-Origin|cors).*['"]\*['"]/i,
      message: "CORS wildcard (*) allows requests from any origin",
      suggestion: "Restrict CORS to specific trusted origins",
    },
    {
      name: "disabled_security",
      severity: "critical",
      pattern: /(?:rejectUnauthorized|NODE_TLS_REJECT_UNAUTHORIZED)\s*[:=]\s*(?:false|0|'0')/i,
      message: "TLS certificate verification disabled",
      suggestion: "Never disable TLS verification in production — fix the certificate chain instead",
    },
    {
      name: "console_credentials",
      severity: "warning",
      pattern: /console\.(?:log|info|debug|warn)\s*\(.*(?:password|secret|token|key)/i,
      message: "Potentially logging sensitive credentials",
      suggestion: "Remove credential logging or redact sensitive values",
    },
  ];

  analyze(diff: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
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
          if (rule.pattern.test(content)) {
            findings.push({
              type: "security",
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
