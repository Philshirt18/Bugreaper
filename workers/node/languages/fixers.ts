import { Language } from './detect';

export interface FixPattern {
  name: string;
  detect: (code: string, description: string) => boolean;
  fix: (code: string, description: string, expected: string) => string;
  explanation: string;
}

// JavaScript/TypeScript fixers
const jsFixes: FixPattern[] = [
  {
    name: 'button-disabled',
    detect: (code, desc) => 
      (desc.toLowerCase().includes('button') || 
       desc.toLowerCase().includes('disabled') || 
       desc.toLowerCase().includes('preventdefault')) &&
      (code.includes('.disabled') || 
       code.includes('disabled') || 
       code.includes('setAttribute') || 
       code.includes('preventDefault')),
    fix: (code) => {
      const lines = code.split('\n');
      
      // Step 1: Remove any line with "// BUG" comment about disabled/button
      const filtered = lines.filter(line => {
        if (line.includes('// BUG') && (line.includes('disabled') || line.includes('button'))) {
          console.log(`    Removing buggy line: ${line.trim()}`);
          return false;
        }
        return true;
      });
      
      let fixed = filtered.join('\n');
      
      // Step 2: Fix common patterns
      fixed = fixed.replace(/(\w+)\.disabled\s*=\s*true;?/g, '$1.disabled = false;');
      fixed = fixed.replace(/<button([^>]*)\s+disabled([^>]*)>/gi, '<button$1$2>');
      fixed = fixed.replace(/(\w+)\.setAttribute\s*\(\s*["']disabled["']\s*,\s*["']disabled["']\s*\);?/g, '');
      
      return fixed;
    },
    explanation: 'Removed code that disables the button'
  },
  {
    name: 'null-check',
    detect: (code, desc) => 
      desc.includes('null') || desc.includes('undefined') || desc.includes('cannot read'),
    fix: (code) => {
      // Add null checks before property access
      return code.replace(/(\w+)\.(\w+)/g, (match, obj, prop) => {
        if (obj === 'console' || obj === 'window' || obj === 'document') return match;
        return `${obj}?.${prop}`;
      });
    },
    explanation: 'Added optional chaining for null safety'
  },
  {
    name: 'async-await',
    detect: (code, desc) => 
      desc.includes('promise') || desc.includes('async') || desc.includes('await'),
    fix: (code) => {
      // Wrap promise chains with async/await
      if (code.includes('.then(') && !code.includes('async ')) {
        return code.replace(/function\s+(\w+)/g, 'async function $1');
      }
      return code;
    },
    explanation: 'Added async/await for promise handling'
  }
];

// Python fixers
const pythonFixes: FixPattern[] = [
  {
    name: 'division-by-zero',
    detect: (code, desc) => 
      (desc.includes('divide') || desc.includes('division')) && desc.includes('zero'),
    fix: (code) => {
      const lines = code.split('\n');
      const fixed: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('/') && !line.includes('//') && !line.includes('"""')) {
          const match = line.match(/^\s*/);
          const indent = match ? match[0] : '';
          fixed.push(`${indent}if denominator == 0:`);
          fixed.push(`${indent}    raise ValueError("Division by zero")`);
        }
        fixed.push(line);
      }
      return fixed.join('\n');
    },
    explanation: 'Added division by zero check'
  },
  {
    name: 'type-hints',
    detect: (code, desc) => 
      desc.includes('type') && code.includes('def ') && !code.includes('->'),
    fix: (code) => {
      return code.replace(/def\s+(\w+)\s*\((.*?)\):/g, 'def $1($2) -> None:');
    },
    explanation: 'Added type hints'
  }
];

// HTML fixers
const htmlFixes: FixPattern[] = [
  {
    name: 'button-disabled-attr',
    detect: (code, desc) => 
      desc.includes('button') && code.includes('disabled'),
    fix: (code) => {
      return code.replace(/<button([^>]*)\s+disabled([^>]*)>/g, '<button$1$2>');
    },
    explanation: 'Removed disabled attribute from button'
  },
  {
    name: 'missing-alt',
    detect: (code, desc) => 
      desc.includes('alt') || (code.includes('<img') && !code.includes('alt=')),
    fix: (code) => {
      return code.replace(/<img([^>]*?)(?!\salt=)>/g, '<img$1 alt="">');
    },
    explanation: 'Added alt attribute to images'
  }
];

// CSS fixers
const cssFixes: FixPattern[] = [
  {
    name: 'missing-semicolon',
    detect: (code) => /:\s*[^;}\n]+\n/.test(code),
    fix: (code) => {
      return code.replace(/:\s*([^;}\n]+)(\n)/g, ': $1;$2');
    },
    explanation: 'Added missing semicolons'
  }
];

const FIXER_MAP: Record<Language, FixPattern[]> = {
  typescript: jsFixes,
  javascript: jsFixes,
  python: pythonFixes,
  html: [...htmlFixes, ...jsFixes], // HTML can contain JavaScript
  css: cssFixes,
  json: [],
  yaml: [],
  markdown: [],
  sql: [],
  unknown: []
};

export function getFixers(language: Language): FixPattern[] {
  return FIXER_MAP[language] || [];
}

export async function applyFix(
  code: string,
  language: Language,
  description: string,
  expected: string,
  filePath: string = 'unknown'
): Promise<{ fixed: string; explanation: string; method: 'pattern' | 'ai'; confidence?: number } | null> {
  console.log(`[applyFix] Language: ${language}, Description: "${description}"`);
  
  // Step 1: Try pattern matching first (fast and reliable for known patterns)
  const fixers = getFixers(language);
  console.log(`[applyFix] Trying ${fixers.length} pattern fixers...`);
  
  for (const fixer of fixers) {
    const detected = fixer.detect(code, description);
    
    if (detected) {
      const fixed = fixer.fix(code, description, expected);
      if (fixed !== code) {
        console.log(`[applyFix] ✅ Pattern fixer "${fixer.name}" succeeded`);
        return { 
          fixed, 
          explanation: fixer.explanation,
          method: 'pattern'
        };
      }
    }
  }
  
  // Step 2: Try AI if pattern matching failed and API key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log(`[applyFix] Pattern matching failed, trying AI...`);
    
    try {
      const { analyzeAndFixBug } = await import('../ai-gemini');
      const aiResult = await analyzeAndFixBug(code, description, filePath, language);
      
      if (aiResult.fixed !== code && aiResult.confidence > 60) {
        console.log(`[applyFix] ✅ AI fix succeeded (confidence: ${aiResult.confidence}%)`);
        return {
          fixed: aiResult.fixed,
          explanation: `AI: ${aiResult.explanation}`,
          method: 'ai',
          confidence: aiResult.confidence
        };
      } else if (aiResult.confidence <= 60) {
        console.log(`[applyFix] ⚠️ AI confidence too low (${aiResult.confidence}%), skipping`);
      }
    } catch (error) {
      console.error(`[applyFix] ❌ AI fix failed:`, error);
    }
  } else {
    console.log(`[applyFix] ⚠️ AI disabled (no API key)`);
  }
  
  console.log(`[applyFix] ❌ No fix found`);
  return null;
}
