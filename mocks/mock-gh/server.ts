import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

const DB_FILE = join(__dirname, 'db.json');

function loadDB() {
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { pulls: [], checks: [] };
  }
}

function saveDB(data: any) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/repos/:owner/:repo/pulls', (req, res) => {
  const { owner, repo } = req.params;
  const { title, body, head, base } = req.body;
  
  const db = loadDB();
  const prNumber = db.pulls.length + 1;
  
  const pr = {
    number: prNumber,
    title,
    body,
    head: { ref: head },
    base: { ref: base },
    state: 'open',
    html_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  db.pulls.push(pr);
  saveDB(db);
  
  console.log(`Mock PR created: #${prNumber} - ${title}`);
  
  res.status(201).json(pr);
});

app.get('/repos/:owner/:repo/pulls/:number', (req, res) => {
  const { number } = req.params;
  const db = loadDB();
  
  const pr = db.pulls.find((p: any) => p.number === parseInt(number));
  
  if (!pr) {
    return res.status(404).json({ message: 'Not Found' });
  }
  
  res.json(pr);
});

app.post('/repos/:owner/:repo/statuses/:sha', (req, res) => {
  const { sha } = req.params;
  const { state, description, context } = req.body;
  
  const db = loadDB();
  
  const check = {
    sha,
    state,
    description,
    context,
    created_at: new Date().toISOString(),
  };
  
  db.checks.push(check);
  saveDB(db);
  
  console.log(`Mock status check: ${context} - ${state}`);
  
  res.status(201).json(check);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock' });
});

const PORT = process.env.MOCK_GH_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Mock GitHub API listening on port ${PORT}`);
});
