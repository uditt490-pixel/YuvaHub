# Migration & Deployment Guide: Express.js Backend on Render.com

This guide details the steps to migrate the YuvaHub backend from Vercel's serverless environment to a persistent cloud instance on Render.com. This architectural shift prevents 10-second timeout crashes, provides a stable environment for long-running AI streams (Gemini), and supports scheduled web scraping tasks.

---

## 1. Prerequisites
Before beginning the deployment, ensure you have:
1. A **GitHub/GitLab** account with your YuvaHub repository pushed.
2. A **Render.com** account.
3. A **MongoDB Atlas** cluster for persistent data (replacing the temporary MockDB).
4. A **Firebase** project for user authentication and session management.

---

## 2. Deploying the Backend on Render (Web Service)

We will deploy the persistent Express server using Render's "Web Service".

1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your YuvaHub repository.
4. Configure the Web Service:
   - **Name**: `yuvahub-backend` (or similar)
   - **Environment**: `Node`
   - **Region**: Select a region close to your database (e.g., Singapore `sgp` or Frankfurt `fra`).
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Select **Free** (or a paid tier if you need higher memory for AI tasks).

### Securing the API & Environment Variables (Web Service)

Scroll down to **Environment Variables** and add the following keys. This is critical to secure the API and set up persistent data:

| Key | Description / Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Render will override and use this internally) |
| `FRONTEND_URL` | The URL of your Vercel frontend (e.g., `https://yuvahub.vercel.app`). **Important:** This secures your API by restricting CORS to only your frontend. |
| `MONGODB_URI` | Your MongoDB Atlas connection string (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/yuvahub?retryWrites=true&w=majority`). |
| `GEMINI_API_KEY` | Your Google AI Studio API key. |
| `FIREBASE_PROJECT_ID` | (Optional/If needed by admin SDK) Your Firebase project ID. |

5. Click **Create Web Service**. Render will now build and deploy your persistent backend.
6. Once deployed, Render will provide a public URL for your backend (e.g., `https://yuvahub-backend.onrender.com`).

---

## 3. Configuring the Frontend (Vercel)

Now that your backend is running independently on Render, you must configure your Vercel frontend to point to the new backend.

1. Go to your **Vercel** dashboard and select your YuvaHub frontend project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add or update the following variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://yuvahub-backend.onrender.com` (Your Render Web Service URL)
4. **Redeploy** your Vercel project so the frontend uses the new `VITE_API_URL`.

---

## 4. Offloading Scraping Workloads (Render Cron Job)

To prevent the scraper from blocking API requests and timing out, you should run it as an automated background Cron Job.

1. In your Render dashboard, click **New +** and select **Cron Job**.
2. Connect the exact same YuvaHub repository.
3. Configure the Cron Job:
   - **Name**: `yuvahub-scraper`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Schedule**: `0 */12 * * *` (Runs every 12 hours)
   - **Command**: `npm run scrape`
4. **Environment Variables**: Re-add the exact same variables you added to the Web Service, especially the `MONGODB_URI`.
5. Click **Create Cron Job**. Your opportunities will now refresh automatically in the background without affecting the student-facing APIs.

---

## 5. Security Checklist

- [ ] **Strict CORS Enforcement**: Ensure `server.ts` uses the `FRONTEND_URL` environment variable in its CORS configuration so that only your Vercel frontend can make requests to the Render backend.
- [ ] **IP Access List**: In MongoDB Atlas, restrict the Network Access to only allow connections from `0.0.0.0/0` (Render IP ranges can change, but you can secure this further if needed) and ensure you are using strong database passwords.
- [ ] **Stateless Client Sessions**: Migrate all user authentication and state management to Firebase on the frontend so the Render backend remains fully stateless and resilient.

## Summary

By separating the architecture:
- **Vercel** handles the React frontend cleanly.
- **Render Web Service** handles heavy AI streams and API routing persistently.
- **Render Cron Job** ingests data reliably in the background.
- **MongoDB Atlas** guarantees your data is never lost during server restarts.
