# CI/CD Pipeline Setup Guide

## Pipeline Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Push Code  │ ──► │   GitHub    │ ──► │   Deploy    │
│  to GitHub  │     │   Actions   │     │   Live!     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
              Test Frontend  Test Backend
                    │           │
                    ▼           ▼
              Deploy to     Deploy to
                Vercel       Render
```

## Setup Steps

### Step 1: Push Code to GitHub

```bash
cd "d:\G ARCADE\project 4"
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### Step 2: Get Vercel Credentials

1. Go to [vercel.com](https://vercel.com) → Settings → Tokens
2. Create new token, copy it
3. Run: `vercel link` in your project folder
4. Check `.vercel/project.json` for `orgId` and `projectId`

### Step 3: Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets → Actions → New secret**

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Your Vercel token |
| `VERCEL_ORG_ID` | From .vercel/project.json |
| `VERCEL_PROJECT_ID` | From .vercel/project.json |

### Step 4: Connect Render to GitHub

1. Go to [render.com](https://render.com)
2. Create "Web Service" → Connect GitHub repo
3. Set root directory: `backend`
4. Build command: `pip install -r requirements-render.txt`
5. Start command: `gunicorn server:app`

Render will auto-deploy when you push to GitHub!

---

## What Happens on Push

1. **Test Frontend** - Runs `npm run build`
2. **Test Backend** - Verifies chatbot works
3. **Deploy Frontend** - Pushes to Vercel (production)
4. **Deploy Backend** - Render auto-detects and deploys

---

## Troubleshooting

### Build Fails
```bash
# Check locally first
npm run build
```

### Secrets Not Found
- Verify secret names match exactly
- Check they're in "Repository secrets" not "Environment secrets"

### Deploy Skipped
- Only runs on `main` or `master` branch
- Check you're pushing to the right branch
