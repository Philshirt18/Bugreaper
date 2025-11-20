import 'dotenv/config';
import express from 'express';
import { processRun } from './orchestrator-simple';
import { getRepositoryList, addProjectByPath, removeProjectByPath, searchForRepositories } from './repo-discovery';
import { scanProject } from './scanner';
import { runFixPipeline } from './fix-pipeline';
import { analyzeAndFixBug, explainCode, generateTests, reviewCode } from './ai-gemini';

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    aiEnabled: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  });
});

// Original orchestrator endpoint
app.post('/run', async (req, res) => {
  try {
    const runId = `run-${Date.now()}`;
    const result = await processRun(runId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Repository management
app.get('/repositories', async (req, res) => {
  try {
    const repos = await getRepositoryList();
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/repositories', async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    await addProjectByPath(path);
    const repos = await getRepositoryList();
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/repositories', async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    await removeProjectByPath(path);
    const repos = await getRepositoryList();
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/repositories/search', async (req, res) => {
  try {
    const { searchPath } = req.body;
    if (!searchPath) {
      return res.status(400).json({ error: 'Search path is required' });
    }
    const repos = await searchForRepositories(searchPath);
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Scanner endpoints
app.post('/scan', async (req, res) => {
  try {
    const { projectPath } = req.body;
    if (!projectPath) {
      return res.status(400).json({ error: 'Project path is required' });
    }
    const result = await scanProject({ rootPath: projectPath });
    
    // Return all files, not just files with issues
    const allFiles = result.allFiles || [];
    
    // Create issues for all files so they show up in the UI
    const fileIssues = allFiles.map((f, idx) => ({
      id: `file-${idx}`,
      file: f.path,
      language: f.language,
      line: 1,
      severity: 'info' as const,
      rule: 'file-scan',
      message: 'File available for analysis',
      status: 'pending' as const,
      createdAt: new Date()
    }));
    
    // Combine with actual issues
    const allIssues = [...result.issues, ...fileIssues];
    
    res.json({ 
      issues: allIssues,
      scannedFiles: result.scannedFiles, 
      duration: result.duration 
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/fix', async (req, res) => {
  try {
    const { rootPath, issueId, file, description, expected } = req.body;
    if (!file || !description) {
      return res.status(400).json({ error: 'File and description are required' });
    }
    const result = await runFixPipeline({ 
      rootPath: rootPath || process.cwd(),
      issueId: issueId || 'manual-fix',
      file, 
      description, 
      expected: expected || '' 
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 🤖 AI-POWERED ENDPOINTS
app.post('/ai/analyze-and-fix', async (req, res) => {
  try {
    const { code, bugDescription, filePath, language } = req.body;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!code || !bugDescription || !language) {
      return res.status(400).json({ error: 'Code, bug description, and language are required' });
    }
    
    const result = await analyzeAndFixBug(code, bugDescription, filePath || 'unknown', language, apiKey);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/ai/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const explanation = await explainCode(code, language, apiKey);
    res.json({ explanation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/ai/generate-tests', async (req, res) => {
  try {
    const { code, language, bugDescription } = req.body;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!code || !language || !bugDescription) {
      return res.status(400).json({ error: 'Code, language, and bug description are required' });
    }
    
    const tests = await generateTests(code, language, bugDescription, apiKey);
    res.json({ tests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/ai/review', async (req, res) => {
  try {
    const { code, language } = req.body;
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const review = await reviewCode(code, language, apiKey);
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BugReaper Worker running on port ${PORT}`);
  console.log(`🤖 AI Features: ${process.env.GEMINI_API_KEY ? '✅ ENABLED' : '❌ DISABLED (add GEMINI_API_KEY to .env)'}`);
});
