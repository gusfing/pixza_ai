# Deploying Node Banana on Hostinger VPS with Coolify

This guide explains how to deploy your app using the "Easy Mode" dashboard.

## 1. Install Coolify on your VPS
If you haven't already, SSH into your Hostinger VPS and run:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh -o install.sh && bash install.sh
```
*(If it prompts for telemetry, just type **Y** or **N**).*
Once finished, go to `http://<your-vps-ip>:8000` in your browser.

## 2. Prepare GitHub Repository
Push your code (including the `Dockerfile` and `docker-compose.yml` I created) to a GitHub repository.

## 3. Create a New Project in Coolify
1. In the Coolify dashboard, click **"Projects"** -> **"Create New"**.
2. Select **"Resources"** -> **"New"** -> **"Public/Private Repository"**.
3. Point it to your GitHub repository.
4. Coolify will automatically detect the **Docker Compose** file.

## 4. Configure Environment Variables
In the Coolify dashboard, go to the **"Environment Variables"** tab for your new resource and add:
- `DATABASE_URL`: `postgresql://...` (Your Neon URL)
- `NEXT_PUBLIC_APP_URL`: `https://your-domain.com` (or your IP)
- `AUTH_SECRET`: (Generate a random string)
- `GEMINI_API_KEY`: (Your Google AI key)
- `WAVESPEED_API_KEY`: (If using)
- `KIE_API_KEY`: (If using)

## 5. Persistence (Important!)
To ensure your generated images are saved forever:
1. Go to the **"Storage"** tab in Coolify.
2. Add a new **Volume**.
3. Source: `node-banana-media`
4. Destination: `/app/storage` (This matches our code).

## 6. Deploy
Click **"Deploy"**! Coolify will handle the build, setup SSL, and launch the app in an isolated Docker container.

---

## 🎁 Bonus: Using Self-Hosted S3 (MinIO)
Coolify can host your own private S3 service (MinIO) so you don't even need the Local Disk storage.

1.  In Coolify, go to **"Resources"** -> **"New"** -> **"S3"** (or MinIO).
2.  Once created, it will give you:
    - `Endpoint` (e.g., `http://31.97.128.162:9000`)
    - `Root User/Password` (These are your `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY`)
3.  Add these to your app's environment variables in Coolify.
4.  The app will automatically switch from Local Disk to your shiny new Private S3!

### Troubleshooting
- **Logs**: You can view real-time logs directly in the Coolify "Logs" tab.
- **Port**: Ensure port 3000 is exposed (Coolify handles the internal mapping automatically).
