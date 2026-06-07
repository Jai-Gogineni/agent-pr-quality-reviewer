import Anthropic from "@anthropic-ai/sdk";
export class PRQualityReviewerAgent {
  private client: Anthropic;
  constructor(apiKey: string) { this.client = new Anthropic({ apiKey }); }
  async reviewDiff(diff: string): Promise<{ score: number; issues: string[]; suggestions: string[] }> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 1024,
      messages: [{ role: "user", content: `Review this PR diff for quality, security, test coverage:\n${diff}\nRespond as JSON: {score, issues, suggestions}` }]
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    return JSON.parse(text);
  }
}
