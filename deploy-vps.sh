#!/bin/bash
# EchoCore VPS Deployment Script
# Run this on your VPS via OpenCode web interface or SSH
# Target: https://echocore-ai.16.jugaar.ai/

set -e

echo "=== EchoCore Deployment ==="
echo "Domain: echocore-ai.16.jugaar.ai"
echo ""

# 1. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
fi

# 2. Clone the repo
echo "Cloning EchoCore..."
cd /opt
sudo rm -rf echocore
sudo git clone https://github.com/HadiqaGohar/Echocore.git echocore
cd echocore

# 3. Create .env file
echo "Creating environment config..."
cat > backend/.env << 'EOF'
STT_MODE=local
LLM_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY_HERE
TTS_MODE=edge
JWT_SECRET=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./echocore.db
CORS_ORIGINS=https://echocore-ai.16.jugaar.ai,http://localhost:3000
EOF

# 4. Build and run with docker-compose
echo "Building Docker image..."
cd /opt/echocore
sudo docker-compose down 2>/dev/null || true
sudo docker-compose up -d --build

# 5. Setup Nginx reverse proxy
echo "Configuring Nginx..."
sudo apt-get install -y nginx

sudo cat > /etc/nginx/sites-available/echocore << 'EOF'
server {
    listen 80;
    server_name echocore-ai.16.jugaar.ai;

    # Frontend (Next.js) - serve from port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (FastAPI) - proxy /api and /audio
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /audio/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://localhost:8000;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/echocore /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 6. Install Node.js for frontend (if not present)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 7. Build and run frontend
echo "Building frontend..."
cd /opt/echocore/frontend
sudo npm install
sudo NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
# Start frontend in background
sudo pkill -f "next start" 2>/dev/null || true
sudo nohup npx next start -p 3000 > /tmp/frontend.log 2>&1 &

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Domain: https://echocore-ai.16.jugaar.ai/"
echo ""
echo "Next steps:"
echo "1. Edit /opt/echocore/backend/.env and add your API keys"
echo "2. Restart backend: cd /opt/echocore && sudo docker-compose restart"
echo "3. Setup SSL with: sudo certbot --nginx -d echocore-ai.16.jugaar.ai"
