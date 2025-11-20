// OpenAI integration for intelligent bug fixing
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Add to .env file
});

export async function aiFixBug(
  code: string,
  bugDescription: string,
  filePath: string,
  language: string
): Promise<{ fixed: string; explanation: string }> {
  
  const prompt = `You are a code fixing expert. Fix this bug with minimal changes.

File: ${filePath}
Language: ${language}
Bug: ${bugDescription}

Current Code:
\`\`\`${language}
${code}
\`\`\`

Instructions:
1. Identify the exact issue
2. Make the MINIMAL change to fix it
3. Preserve all other functionality
4. Return ONLY the fixed code, no explanations

Fixed Code:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert code fixer. Return only fixed code, no markdown, no explanations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3, // Lower = more deterministic
    max_tokens: 2000
  });

  const fixedCode = response.choices[0].message.content || code;
  
  return {
    fixed: fixedCode.replace(/```[\w]*\n?/g, '').trim(),
    explanation: 'AI-generated fix'
  };
}

// Usage in your fixer
export async function aiFixWithFallback(
  code: string,
  bugDescription: string,
  filePath: string,
  language: string
): Promise<string> {
  try {
    const result = await aiFixBug(code, bugDescription, filePath, language);
    return result.fixed;
  } catch (error) {
    console.error('AI fix failed, using pattern matching:', error);
    // Fallback to pattern matching
    return code;
  }
}
