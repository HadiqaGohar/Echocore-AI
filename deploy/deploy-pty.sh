#!/bin/bash
# ========================================
# EchoCore VPS Deployment Script
# Paste this in OpenCode PTY WebSocket
# Target: https://echocore-ai.16.jugaar.ai/
# ========================================

set -e

DOMAIN="echocore-ai.16.jugaar.ai"

echo "🚀 Starting EchoCore deployment for $DOMAIN"
echo ""

# Step 1: Clone repo
echo "📦 [1/6] Cloning repository..."
cd /opt
rm -rf echocore
git clone https://github.com/HadiqaGohar/Echocore.git echocore
cd echocore

# Step 2: Create backend .env with secure JWT secret
echo "🔐 [2/6] Creating secure environment..."
JWT_SECRET=$(openssl rand -hex 32)
cat > backend/.env << EOF
STT_MODE=local
LLM_PROVIDER=gemini
GEMINI_API_KEY=
OPENROUTER_API_KEY=
TTS_MODE=edge
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./echocore.db
CORS_ORIGINS=https://${DOMAIN},http://localhost:3000
EOF

# Step 3: Add standalone output to next.config.ts
echo "⚙️  [3/6] Configuring Next.js for Docker..."
sed -i 's/const nextConfig: NextConfig = {/const nextConfig: NextConfig = {\n  output: "standalone",/' frontend/next.config.ts

# Step 4: Build and start containers
echo "🐳 [4/6] Building Docker containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d --build

# Step 5: Copy nginx config
echo "🌐 [5/6] Updating Nginx configuration..."
cp deploy/nginx/echocore-ai.conf /pilotron/nginx/echocore-ai.conf
docker restart pilotron-nginx

# Step 6: Get SSL certificate
echo "🔒 [6/6] Setting up SSL certificate..."
sleep 3
docker exec pilotron-nginx sh -c "
  apt-get update -qq && apt-get install -y -qq certbot &&
  certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --non-interactive --agree-tos --email admin@jugaar.ai --force-renewal
" 2>/dev/null || echo "⚠️  SSL cert may need manual creation. Run:"
  echo "   docker exec -it pilotron-nginx certbot certonly --webroot -w /var/www/certbot -d $DOMAIN"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Frontend:  https://$DOMAIN/"
echo "🔌 Backend:   https://$DOMAIN/api/health"
echo "📊 Dashboard: https://$DOMAIN/dashboard"
echo ""
echo "📝 Next steps:"
echo "   1. Open https://$DOMAIN/ in browser"
echo "   2. Register a new account"
echo "   3. Start chatting!"
