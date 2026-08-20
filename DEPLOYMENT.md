# DevPilot Deployment Guide

DevPilot is designed to be deployed across three distinct cloud platforms for optimal performance and free tier availability:

- **Database**: Neon (Serverless PostgreSQL)
- **Backend API**: Render (Spring Boot)
- **Frontend SPA**: Vercel (React + Vite)

This document outlines the step-by-step process for deploying the application.

---

## 1. Database Deployment (Neon)

Neon provides a persistent PostgreSQL database suitable for production data. (Do NOT use Render's Free PostgreSQL, as it expires after 30 days).

1. Create a free account at [Neon.tech](https://neon.tech/).
2. Create a new Project.
3. Once created, navigate to the **Dashboard** and find your connection string (`postgresql://username:password@hostname/dbname?sslmode=require`).
4. Note this connection string down. We will supply it to the Render backend.

---

## 2. Backend Deployment (Render)

Render will host the Spring Boot API.

### Prerequisites
- Push your codebase to a GitHub repository.

### Steps
1. Create a free account at [Render.com](https://render.com/).
2. Click **New** > **Web Service**.
3. Connect your GitHub repository containing the DevPilot code.
4. **Configuration Details**:
   - **Name**: `devpilot-backend` (or similar)
   - **Region**: Choose a region close to your Neon database (e.g., US East, Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `backend` (Important: This tells Render where the Dockerfile is).
   - **Runtime**: `Docker`
   - **Instance Type**: Free
5. **Environment Variables**: Add the following under the Advanced section:
   - `DATABASE_URL`: Your Neon connection string (JDBC format). Format: `jdbc:postgresql://<neon-hostname>:5432/<neon-db>?sslmode=require`
   - `DATABASE_USERNAME`: Your Neon username
   - `DATABASE_PASSWORD`: Your Neon password
   - `DATABASE_DRIVER`: `org.postgresql.Driver`
   - `DATABASE_DIALECT`: `org.hibernate.dialect.PostgreSQLDialect`
   - `JWT_SECRET`: Generate a random secure 256-bit hex string.
   - `ENCRYPTION_KEY`: A 32-character secure string for AES-256 (e.g. `12345678901234567890123456789012`).
   - `AI_API_KEY`: Your Gemini API key.
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID.
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret.
   - `FRONTEND_URL`: (Temporary) `http://localhost:5173`. We will update this later.
6. Click **Create Web Service**. Wait for the build and deployment to finish. 
7. Verify deployment by visiting `https://<your-render-url>/api/health`. It should return `{"status":"UP"}`.

---

## 3. Frontend Deployment (Vercel)

Vercel will host the React SPA.

### Steps
1. Create a free account at [Vercel.com](https://vercel.com/) and link it to GitHub.
2. Click **Add New** > **Project** and import your DevPilot repository.
3. **Configuration Details**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (Project Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://devpilot-backend.onrender.com`). Do NOT add a trailing slash.
5. Click **Deploy**. Wait for Vercel to generate your production URL (e.g., `https://devpilot-frontend.vercel.app`).

---

## 4. Finalizing Configuration (CORS & OAuth)

Now that both the Frontend and Backend are deployed and have public URLs, we need to finalize the security settings.

### Update Backend CORS
1. Go back to your Render Dashboard for the backend service.
2. Go to **Environment**.
3. Update `FRONTEND_URL` to your new Vercel URL (e.g., `https://devpilot-frontend.vercel.app`). Do NOT add a trailing slash.
4. Render will automatically redeploy the service.

### Update GitHub OAuth
1. Go to your GitHub Developer Settings > OAuth Apps.
2. Select your DevPilot OAuth App.
3. Update the **Homepage URL** to your Vercel URL.
4. Update the **Authorization callback URL** to your Vercel URL + `/github/callback` (e.g., `https://devpilot-frontend.vercel.app/github/callback`).

---

## 5. End-to-End Verification

1. Open your Vercel URL in an incognito window.
2. Verify the application loads correctly.
3. Attempt to sign up or sign in using GitHub OAuth.
4. Upon successful login, interact with the dashboard, create a project, and verify data persists (verifying the Neon database connection).
5. Add your Vercel URL to the `README.md` as your Live Demo.
