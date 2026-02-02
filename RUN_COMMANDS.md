# CARIVIX Attendance Management System - Run Commands

## Prerequisites
- Node.js v20.18+ or v22.12+
- Python 3.10+
- npm (comes with Node.js)

---

## Quick Start (Development)

### Terminal 1: Frontend
```powershell
cd "d:\G ARCADE\project 4"
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### Terminal 2: Backend
```powershell
cd "d:\G ARCADE\project 4\backend"
pip install -r requirements.txt
python server.py
```
Backend runs at: http://localhost:5000

---

## Login Credentials

| Role     | Email              | Password     |
|----------|-------------------|--------------|
| Employee | john@carivix.com  | employee123  |
| Admin    | admin@carivix.com | admin123     |

---

## Install Dependencies (First Time Only)

### Frontend Dependencies
```powershell
cd "d:\G ARCADE\project 4"
npm install
```

### Backend Dependencies (Chatbot Only)
```powershell
cd "d:\G ARCADE\project 4\backend"
pip install flask flask-cors scikit-learn numpy
```

### Backend Dependencies (Full - with Voice)
```powershell
cd "d:\G ARCADE\project 4\backend"
pip install -r requirements.txt
```

---

## Stop All Servers

```powershell
# Force stop all Node and Python processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Build for Production

### Frontend Build
```powershell
cd "d:\G ARCADE\project 4"
npm run build
```
Output: `dist/` folder

---

## Cloud Deployment Commands

### Deploy Frontend to Vercel
```powershell
npm install -g vercel
cd "d:\G ARCADE\project 4"
vercel login
vercel
```

### Deploy Backend to Render
1. Push to GitHub
2. Go to render.com
3. Connect repo with settings:
   - Root: `backend`
   - Build: `pip install -r requirements-render.txt`
   - Start: `gunicorn server:app`

---

## API Endpoints

| Method | Endpoint              | Description           |
|--------|----------------------|----------------------|
| POST   | /api/chat            | Send chat message    |
| POST   | /api/voice/register  | Register voice       |
| POST   | /api/voice/identify  | Identify speaker     |
| GET    | /api/voice/registered| List registered      |
| GET    | /api/health          | Health check         |

---

## Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Clear npm cache
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### Reset Python packages
```powershell
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```
