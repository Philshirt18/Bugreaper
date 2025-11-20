// Google Gemini AI integration for intelligent bug fixing
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGenAI(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No API key provided');
  }
  return new GoogleGenerativeAI(key);
}

export async function analyzeAndFixBug(
  code: string,
  bugDescription: string,
  filePath: string,
  language: string,
  apiKey?: string
): Promise<{ fixed: string; explanation: string; confidence: number }> {
  
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `You are an expert code debugger. Analyze and fix this bug with MINIMAL changes.

File: ${filePath}
Language: ${language}
Bug: ${bugDescription}

Current Code:
\`\`\`${language}
${code}
\`\`\`

Instructions:
1. Identify the exact cause of the bug
2. Make the SMALLEST possible change to fix it
3. Preserve all existing functionality
4. Return ONLY valid ${language} code
5. Do NOT add comments or explanations in the code

Return your response in this EXACT format:
FIXED_CODE:
[your fixed code here]

EXPLANATION:
[brief explanation of what you changed and why]

CONFIDENCE:
[number from 0-100 indicating your confidence this fixes the bug]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response
    const fixedMatch = text.match(/FIXED_CODE:\s*```[\w]*\n([\s\S]*?)```/i) || 
                       text.match(/FIXED_CODE:\s*\n([\s\S]*?)(?=EXPLANATION:|$)/i);
    const explanationMatch = text.match(/EXPLANATION:\s*\n([\s\S]*?)(?=CONFIDENCE:|$)/i);
    const confidenceMatch = text.match(/CONFIDENCE:\s*\n?(\d+)/i);
    
    const fixed = fixedMatch ? fixedMatch[1].trim() : code;
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'AI-generated fix';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
    
    return { fixed, explanation, confidence };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function explainCode(
  code: string,
  language: string,
  apiKey?: string
): Promise<string> {
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `Explain this ${language} code in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide a clear, concise explanation that a junior developer would understand.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateTests(
  code: string,
  language: string,
  bugDescription: string,
  apiKey?: string
): Promise<string> {
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `Generate test cases for this ${language} code that would catch this bug: "${bugDescription}"

Code:
\`\`\`${language}
${code}
\`\`\`

Generate 3-5 test cases that:
1. Test the bug scenario
2. Test edge cases
3. Test the happy path

Return ONLY the test code, no explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function reviewCode(
  code: string,
  language: string,
  apiKey?: string
): Promise<{ issues: string[]; suggestions: string[]; score: number }> {
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `Review this ${language} code for quality, bugs, and best practices:

\`\`\`${language}
${code}
\`\`\`

Return your response in this format:
ISSUES:
- [list any bugs or problems]

SUGGESTIONS:
- [list improvements]

SCORE:
[0-100 quality score]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const issuesMatch = text.match(/ISSUES:\s*\n([\s\S]*?)(?=SUGGESTIONS:|$)/i);
  const suggestionsMatch = text.match(/SUGGESTIONS:\s*\n([\s\S]*?)(?=SCORE:|$)/i);
  const scoreMatch = text.match(/SCORE:\s*\n?(\d+)/i);
  
  const issues = issuesMatch ? issuesMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '')) : [];
  const suggestions = suggestionsMatch ? suggestionsMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '')) : [];
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
  
  return { issues, suggestions, score };
}
