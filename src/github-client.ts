export interface PRInfo {
  title: string;
  author: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  baseBranch: string;
  headBranch: string;
}

export class GitHubClient {
  private token: string;
  private baseUrl = "https://api.github.com";

  constructor(token: string) {
    this.token = token;
  }

  async getPRDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3.diff",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  async getPRInfo(owner: string, repo: string, prNumber: number): Promise<PRInfo> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const user = data.user as Record<string, string>;
    const base = data.base as Record<string, unknown>;
    const head = data.head as Record<string, unknown>;

    return {
      title: data.title as string,
      author: user.login,
      filesChanged: data.changed_files as number,
      additions: data.additions as number,
      deletions: data.deletions as number,
      baseBranch: (base.ref as string) ?? "main",
      headBranch: (head.ref as string) ?? "feature",
    };
  }

  async postReviewComment(
    owner: string,
    repo: string,
    prNumber: number,
    body: string
  ): Promise<void> {
    await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body, event: "COMMENT" }),
      }
    );
  }
}
