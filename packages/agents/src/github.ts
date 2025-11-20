export interface PullRequestOptions {
  title: string;
  body: string;
  head: string;
  base: string;
  repository: string;
}

export async function createPullRequest(options: PullRequestOptions): Promise<any> {
  const mockMode = process.env.MOCK_MODE === 'true';
  const endpoint = mockMode ? 'http://localhost:3002' : 'https://api.github.com';
  
  const response = await fetch(`${endpoint}/repos/${options.repository}/pulls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN || 'mock-token'}`,
    },
    body: JSON.stringify({
      title: options.title,
      body: options.body,
      head: options.head,
      base: options.base,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create PR: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getPullRequest(repository: string, prNumber: number): Promise<any> {
  const mockMode = process.env.MOCK_MODE === 'true';
  const endpoint = mockMode ? 'http://localhost:3002' : 'https://api.github.com';
  
  const response = await fetch(`${endpoint}/repos/${repository}/pulls/${prNumber}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get PR: ${response.statusText}`);
  }
  
  return response.json();
}
