# LUXEVRA ATELIER — Production Deployment Guide

LUXEVRA Atelier is a premium, full-stack e-commerce experience built with a modern React 19 + Vite frontend and a highly secure Express (TypeScript) server backend.

This guide outlines instructions to run, build, and deploy the application into production across various hosting platforms.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, and Motion for luxurious animations.
- **Backend**: Express.js (TypeScript compiled to clean ES Module/CommonJS via Esbuild).
- **Security & Auth**: Secure local database (`users_db.json` / `products_db.json`), JWT authorization, PBKDF2 cryptography, and a production-ready 6-digit OTP passcode recovery system.
- **Notification Engine**: Nodemailer (via SMTP) with beautifully branded, gold-accented HTML templates.

---

## ⚙️ Environment Configurations (`.env`)
Before deploying, make sure to configure the environment variables. Use `.env.example` as a template:

```env
# Gemini AI (Optional - if using AI capabilities)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Self-referential application URL (Used for API references)
APP_URL="https://your-luxevra-domain.com"

# JWT Secret (Crucial: Define a long, secure random string in production)
JWT_SECRET="your-ultra-secure-random-jwt-key"

# SMTP Mailer Settings (Required for sending actual OTP emails)
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="postmaster@your-luxevra-domain.com"
SMTP_PASS="your-smtp-password"
```

*Note: In development mode, if SMTP is not configured, the system falls back to a sandbox developer console and interactive UI telemetry panel. In production (`NODE_ENV=production`), the OTP credentials are never exposed in API responses to maintain optimal security.*

---

## 🚀 Deployment Destinations

### 1. 🐳 Container / Cloud Run (Native Deployment)
The application is pre-packaged with a compliant full-stack production script and automatically listens on port `3000` (host `0.0.0.0`) inside Docker containers. This is the recommended route for Google Cloud Run, AWS ECS, or DigitalOcean App Platform.

1. **Build Step**:
   ```bash
   npm run build
   ```
   *This compiles the React assets into `/dist` and bundles the Express server into `dist/server.cjs` via Esbuild.*

2. **Start Step**:
   ```bash
   npm run start
   ```

3. **Sample Dockerfile**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   ENV NODE_ENV=production
   CMD ["npm", "run", "start"]
   ```

---

### 2. ▲ Vercel Deployment (Full-Stack or Serverless)
To deploy this full-stack application on Vercel, you can configure it to build the React frontend statically and run the Express API as a Vercel Serverless Function.

1. Create a `vercel.json` file in the root directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.html",
         "use": "@vercel/static"
       },
       {
         "src": "server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server.ts"
       },
       {
         "src": "/(.*)",
         "dest": "dist/$1"
       }
     ]
   }
   ```
2. Set up the Environment Variables on your Vercel Dashboard.
3. Deploy via the Vercel CLI (`vercel`) or connect your GitHub repository.

---

### 3. 🚄 Render / Railway / Heroku (Full-Stack PaaS)
These platforms are the easiest way to deploy standard full-stack Node.js servers with absolute zero configuration.

1. Connect your repository to **Railway** or **Render**.
2. Configure the build commands on the dashboard:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Add your Environment Variables (`JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
4. Railway/Render will automatically bind to the default port and route traffic.

---

### 4. 🗂️ Static Web Hosts (Netlify / Cloudflare Pages / GitHub Pages)
Because the app features dynamic API endpoints (`/api/auth/*`), static hosts alone cannot run the backend server. To deploy onto static hosting:

1. **Backend Server**: Host the backend Express server on a free/affordable PaaS like Render, Railway, or Koyeb.
2. **Frontend client**: Configure the API endpoints in the client to point to the external backend server.
3. **Build the static site**:
   ```bash
   npm run build
   ```
4. Deploy the generated `/dist` folder to Netlify, Cloudflare Pages, or GitHub Pages.

---

## 🔒 Security Best Practices for Production
- **Change Default Keys**: Never deploy with the fallback `JWT_SECRET`. Generate a cryptographically strong random string.
- **Enable HTTPS**: Ensure your application is served exclusively over SSL/TLS.
- **Password Strength Rules**: The recovery password change enforces standard production-grade password strength policies (8+ chars, upper/lower casing, digits, and special characters).
- **OTP Expiration**: OTPs are valid for exactly 10 minutes and strictly single-use. Verification tickets are valid for 5 minutes.
- **Rate-Limiting Protection**: The server blocks brute-force verification requests (max 5 tries) and implements a 60-second cooldown on OTP resend requests.

---

## 🖥️ Local Verification
To test the production build locally:
```bash
# Clear any older builds
npm run clean

# Run full production compilation
npm run build

# Start the compiled production bundle
NODE_ENV=production npm run start
```
The application will launch on `http://localhost:3000`.

---
*Crafted elegantly with care. © 2026 LUXEVRA Atelier.*
