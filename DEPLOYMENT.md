# Revora — Deployment Guide

<div align="center">

![Deploy Status](https://img.shields.io/badge/Deploy-1--Click%20Ready-10B981?style=for-the-badge&logo=render)
![Target](https://img.shields.io/badge/Platforms-Render%20%7C%20Railway%20%7C%20Docker-3B82F6?style=for-the-badge)
![Buildathon](https://img.shields.io/badge/Razorpay%20AI%20Buildathon-2026-6366F1?style=for-the-badge)

### **Production Deployment Instructions for Revora AI Revenue Recovery Agent**

</div>

---

## ⚡ Option 1: 1-Click Deploy on Render (Recommended & Free)

Render can build and run both the Express API and the Vite React frontend on a **single free Web Service** with zero CORS configuration.

### Steps:
1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repo:  
   `https://github.com/Mauliksiwach/revora-ai-revenue-recovery-agent`
4. Configure the service settings:
   - **Name**: `revora-ai-recovery-agent` (or your choice)
   - **Region**: Singapore or Oregon
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. *(Optional)* Add Environment Variables in the **Environment** tab:
   - `NODE_ENV`: `production`
   - `ENABLE_IN_MEMORY_FALLBACK`: `true`
   - `SIMULATION_DATA_SIZE`: `1200`
   - *(Optional Supabase credentials if using persistent DB)*:
     - `SUPABASE_URL`: `<your-supabase-project-url>`
     - `SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a public URL:  
   `https://revora-ai-recovery-agent.onrender.com`

---

## 🚂 Option 2: 1-Click Deploy on Railway

Railway uses the bundled [`railway.json`](./railway.json) configuration automatically.

### Steps:
1. Go to **[railway.app](https://railway.app/)** and sign in with GitHub.
2. Click **+ New Project** → **Deploy from GitHub repo**.
3. Select `revora-ai-revenue-recovery-agent`.
4. Railway will automatically detect the build and start commands from root `package.json` and `railway.json`.
5. Under service **Settings** → **Networking**, click **Generate Domain**.
6. Visit your live domain!

---

## 🐳 Option 3: Docker Deployment (Cloud Run, AWS ECS, VPS)

A multi-stage [`Dockerfile`](./Dockerfile) is provided for deploying on any container platform:

```bash
# Build the production container image
docker build -t revora-agent .

# Run the container locally or on a server
docker run -p 5000:5000 -e NODE_ENV=production revora-agent
```

Access the application at `http://localhost:5000`.

---

## 🔍 Post-Deployment Health Verification

Once your service is live, verify the installation by checking:

1. **System Health Check**:
   ```bash
   curl https://<your-deployed-app-url>/api/v1/health
   # Expected: {"status":"HEALTHY","service":"Revora — AI Revenue Recovery Agent","timestamp":"..."}
   ```
2. **Dashboard Overview**:
   ```bash
   curl https://<your-deployed-app-url>/api/v1/analytics/overview
   ```
3. **Frontend Application**:
   Open `https://<your-deployed-app-url>` directly in your browser. All 7 tabs will be interactive!

---

<div align="center">

**Built for the Razorpay AI Buildathon 2026**

</div>
