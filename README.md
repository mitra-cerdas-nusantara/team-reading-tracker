
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
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Deployment Updates

Whenever you make changes to the code and want to deploy them to the production server, follow these steps:

```bash
# 1. Pull the latest code
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Rebuild the application (Crucial for frontend and server changes)
npm run build

# 4. Restart the PM2 process to apply changes
pm2 restart reading-tracker
```

#### Troubleshooting: Module Version Mismatch
If you encounter an error stating that `better-sqlite3` was compiled against a different Node.js version after an update, run:
```bash
npm rebuild better-sqlite3
```
This ensures the native SQLite bindings are correctly built for your current environment.
