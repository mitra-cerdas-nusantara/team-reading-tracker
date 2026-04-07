<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment to Production Server

This guide explains how to deploy the Team Reading Tracker to a production Linux server (e.g., Ubuntu).

### 1. Prerequisites

- **Node.js**: Version 18 or higher (Version 20+ recommended).
- **Nginx**: For reverse proxy and SSL (optional but recommended).
- **PM2**: For process management.

### 2. Prepare the Server

```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 3. Clone and Build

```bash
# Clone the repository
git clone <your-repo-url>
cd team-reading-tracker

# Install dependencies
npm install

# Create .env file for production
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
nano .env

# Build the application (Frontend + Server)
npm run build
```

### 4. Run with PM2

PM2 will keep your app running in the background and restart it if it crashes.

```bash
# Start the server
pm2 start dist/server.cjs --name "reading-tracker"

# Save PM2 list to restart on reboot
pm2 save
pm2 startup
```

### 5. Persistence (Database)

The application uses SQLite. The database is stored in the `data/` directory. 
**IMPORTANT**: Ensure the `data/` directory is backed up regularly and has correct write permissions for the user running the app.

### 6. Nginx Reverse Proxy (Optional)

Create an Nginx config to serve the app on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Updates

To deploy updates:
```bash
git pull
npm install
npm run build
pm2 restart reading-tracker
```
