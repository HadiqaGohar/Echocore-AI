#!/bin/bash
# EchoCore Deployment Script for VPS
# Run this via OpenCode PTY WebSocket
# Target: https://echocore-ai.16.jugaar.ai/

set -e

DOMAIN="echocore-ai.16.jugaar.ai"
DEPLOY_DIR="/opt/echocore"

echo "=== EchoCore Deployment ==="
echo "Domain: $DOMAIN"
echo ""

# 1. Clone the repo
echo "[1/7] Cloning EchoCore..."
cd /opt
rm -rf echocore
git clone https://github.com/HadiqaGohar/Echocore.git echocore
cd echocore

# 2. Create backend .env
echo "[2/7] Creating environment config..."
JWT_SECRET_VAL=$(openssl rand -hex 32)
cat > backend/.env << EOF
STT_MODE=local
LLM_PROVIDER=gemini
GEMINI_API_KEY=
OPENROUTER_API_KEY=
TTS_MODE=edge
JWT_SECRET=${JWT_SECRET_VAL}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./echocore.db
CORS_ORIGINS=https://${DOMAIN},http://localhost:3000
EOF

# 3. Add next.config.ts output: standalone
echo "[3/7] Configuring Next.js for Docker..."
cd frontend
if ! grep -q "output.*standalone" next.config.ts; then
  sed -i 's/const nextConfig = {/const nextConfig = {\n  output: "standalone",/' next.config.ts
fi
cd ..

# 4. Build and start Docker containers
echo "[4/7] Building Docker containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Copy nginx config to pilotron-nginx
echo "[5/7] Updating Nginx config..."
cp deploy/nginx/echocore-ai.conf /pilotron/nginx/echocore-ai.conf

# 6. Restart nginx container
echo "[6/7] Restarting Nginx..."
docker restart pilotron-nginx

# 7. Get SSL certificate
echo "[7/7] Getting SSL certificate..."
docker exec pilotron-nginx sh -c "
  apt-get update && apt-get install -y certbot &&
  certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --non-interactive --agree-tos --email admin@jugaar.ai
" 2>/dev/null || echo "SSL cert may already exist or will be created on first access"

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8001"
echo "Domain: https://$DOMAIN/"
echo ""
echo "If SSL is not working, run:"
echo "  docker exec -it pilotron-nginx certbot certonly --webroot -w /var/www/certbot -d $DOMAIN"
