export interface CoverageFinding {
  type: "coverage";
  severity: "warning" | "info";
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export class CoverageAnalyzer {
  analyze(diff: string): CoverageFinding[] {
    const findings: CoverageFinding[] = [];
    const files = this.parseDiffFiles(diff);

    for (const file of files) {
      if (this.isSourceFile(file.path) && !this.hasCorrespondingTest(file.path, files)) {
        findings.push({
          type: "coverage",
          severity: "warning",
          file: file.path,
          message: `New/modified source file without corresponding test changes`,
          suggestion: `Consider adding tests for ${file.path}`,
        });
      }

      const untestedFunctions = this.findUntestedFunctions(file);
      for (const fn of untestedFunctions) {
        findings.push({
          type: "coverage",
          severity: "info",
          file: file.path,
          line: fn.line,
          message: `New function '${fn.name}' may lack test coverage`,
          suggestion: `Add unit test for ${fn.name}()`,
        });
      }
    }

    return findings;
  }

  private parseDiffFiles(diff: string): Array<{ path: string; additions: string[] }> {
    const files: Array<{ path: string; additions: string[] }> = [];
    const fileBlocks = diff.split(/^diff --git/m).filter(Boolean);

    for (const block of fileBlocks) {
      const pathMatch = block.match(/b\/(.+)/);
      if (!pathMatch) continue;

      const additions = block
        .split("\n")
        .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
        .map((line) => line.slice(1));

      files.push({ path: pathMatch[1], additions });
    }

    return files;
  }

  private isSourceFile(path: string): boolean {
    return /\.(ts|js|tsx|jsx)$/.test(path) && !this.isTestFile(path);
  }

  private isTestFile(path: string): boolean {
    return /\.(test|spec|e2e)\.(ts|js|tsx|jsx)$/.test(path) || path.includes("__tests__");
  }

  private hasCorrespondingTest(
    sourcePath: string,
    files: Array<{ path: string; additions: string[] }>
  ): boolean {
    const baseName = sourcePath.replace(/\.(ts|js|tsx|jsx)$/, "");
    return files.some(
      (f) =>
        f.path.includes(`${baseName}.test.`) ||
        f.path.includes(`${baseName}.spec.`) ||
        f.path.includes("__tests__")
    );
  }

  private findUntestedFunctions(
    file: { path: string; additions: string[] }
  ): Array<{ name: string; line: number }> {
    const functions: Array<{ name: string; line: number }> = [];

    file.additions.forEach((line, index) => {
      const fnMatch = line.match(
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/
      );
      if (fnMatch) {
        functions.push({ name: fnMatch[1] ?? fnMatch[2], line: index + 1 });
      }
    });

    return functions;
  }
}
