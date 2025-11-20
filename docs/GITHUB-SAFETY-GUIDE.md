# 🔒 GitHub Safety Guide - Protecting Your API Key

## ✅ How Your API Key Stays Safe

### 1. The `.gitignore` File

Your project has a `.gitignore` file that contains:
```
.env
.env.local
```

This tells Git to **completely ignore** these files. They will:
- ❌ Never be tracked by Git
- ❌ Never be committed
- ❌ Never be pushed to GitHub
- ❌ Never be visible to anyone

### 2. Where Your API Key Lives

**Local Development (Your Computer):**
- File: `workers/node/.env`
- Contains: Your actual API key
- Status: **Ignored by Git** ✅
- Visible to: **Only you** ✅

**GitHub (Public Repo):**
- File: `workers/node/.env`
- Status: **Does NOT exist** ✅
- Contains: **Nothing** (file not uploaded)
- Visible to: **Nobody** ✅

### 3. How Users Get Their Own Keys

When someone clones your repo:

1. They get: `workers/node/.env.example` (template, no real key)
2. They create: `workers/node/.env` (their own file)
3. They add: Their own API key
4. Their `.env` is also ignored by Git

**OR** they use the in-app settings:
1. Open the app
2. Click the purple key icon
3. Enter their API key
4. Stored in browser localStorage (never in files)

## 🚀 Before Pushing to GitHub

### Step 1: Verify `.env` is Ignored

```bash
# Check git status
git status

# Your .env file should NOT appear in the list
# If it does, STOP and check your .gitignore
```

### Step 2: Check What Will Be Committed

```bash
# See what files will be added
git add .
git status

# Verify .env is NOT in the list
```

### Step 3: Double-Check `.gitignore`

```bash
# Make sure .env is in .gitignore
cat .gitignore | grep .env

# Should show:
# .env
# .env.local
```

## 🎯 Safe Workflow

### Initial Setup (First Time)

```bash
# 1. Initialize Git
git init

# 2. Add all files (except .env - it's ignored!)
git add .

# 3. Check what's being added
git status
# .env should NOT be in the list!

# 4. Commit
git commit -m "Initial commit - BugReaper AI Bug Fixer"

# 5. Add remote
git remote add origin https://github.com/yourusername/bugreaper.git

# 6. Push
git push -u origin main
```

### Daily Development

```bash
# 1. Make changes
# 2. Add files
git add .

# 3. Always check before committing
git status
# .env should NEVER appear!

# 4. Commit and push
git commit -m "Add new feature"
git push
```

## 🛡️ Extra Safety Measures

### 1. Use `.env.example` Template

We've created `workers/node/.env.example`:
```bash
# Google Gemini API Key
GEMINI_API_KEY=your_api_key_here
```

This file:
- ✅ IS committed to GitHub
- ✅ Shows users what they need
- ❌ Does NOT contain real keys

### 2. In-App API Key Entry

Users can enter their API key directly in the app:
- Click purple key icon (bottom right)
- Enter API key
- Stored in browser localStorage
- Never touches the file system
- Never goes to GitHub

### 3. Environment Variable Check

The app checks for API keys in this order:
1. User's key from browser (localStorage)
2. Server's key from `.env` (local only)
3. Shows error if neither exists

## ⚠️ What If I Already Committed My Key?

If you accidentally committed your API key:

### 1. Revoke the Old Key
- Go to https://makersuite.google.com/app/apikey
- Delete the exposed key
- Create a new one

### 2. Remove from Git History
```bash
# Remove the file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch workers/node/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### 3. Add New Key Locally
- Add new key to your local `.env`
- Verify `.env` is in `.gitignore`
- Never commit it again

## ✅ Verification Checklist

Before making your repo public:

- [ ] `.env` is in `.gitignore`
- [ ] Run `git status` - `.env` is NOT listed
- [ ] `.env` contains no real API key (or is empty)
- [ ] `.env.example` exists with template
- [ ] `HACKATHON-SETUP.md` explains how to get API keys
- [ ] In-app settings UI works for API key entry
- [ ] Test with a fresh clone in a different folder

## 🎉 You're Safe When:

✅ `.gitignore` contains `.env`  
✅ `git status` never shows `.env`  
✅ Your `.env` file is empty or has placeholder  
✅ Users can enter keys in the app  
✅ Documentation explains how to get keys  

## 🔥 Quick Test

```bash
# Clone your repo to a new folder
cd /tmp
git clone https://github.com/yourusername/bugreaper.git test-clone
cd test-clone

# Check if .env exists
ls workers/node/.env
# Should show: No such file or directory ✅

# Check if .env.example exists
ls workers/node/.env.example
# Should show: workers/node/.env.example ✅
```

If `.env` doesn't exist in the clone, you're safe! 🎉

---

**Your API key is safe as long as `.env` is in `.gitignore`!** 🔒
