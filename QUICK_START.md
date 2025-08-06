# 🚀 Blacktop Blackout - Quick Start Guide

## One-Command Deployment

```bash
# Clone and deploy the complete system
git clone <repository-url>
cd blacktop-blackout-monorepo
./start.sh
```

**That's it!** The system will be available at:
- **Web App**: http://localhost:3000
- **API**: http://localhost:3333
- **Mobile**: Built and ready for deployment

### 🔧 Advanced Options

```bash
# Full monitoring and control
./start-blacktop.sh

# Production deployment
./deploy.sh

# Stop all services
./stop.sh
```

---

## 🐳 Docker Deployment (Alternative)

```bash
# Using Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 📱 Mobile App Development

```bash
# Build mobile app
npm run mobile:build

# Open Android project (requires Android Studio)
npm run mobile:android

# Build APK
npm run apk:build
```

---

## 🔧 Development Mode

```bash
# Start development servers
npm run dev

# Run tests
npm test

# Build everything
npm run build
```

---

## 📋 Default Credentials

**Admin User (created during database initialization):**
- Email: `admin@blacktopsolutions.com`
- Password: `admin123` (change immediately)

**Manager User:**
- Email: `manager@blacktopsolutions.com`
- Password: `manager123` (change immediately)

---

## 🌍 Environment Configuration

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update key variables:**
   ```bash
   # Required for production
   JWT_SECRET=your-secure-secret-key-minimum-32-characters
   DB_PASSWORD=your-secure-database-password
   
   # Optional API keys
   WEATHER_API_KEY=your-weather-api-key
   MAPS_API_KEY=your-google-maps-key
   ```

---

## 📊 System Status

After deployment, check system health:

```bash
# API health
curl http://localhost:3333/health

# Web app
curl http://localhost:3000

# Database connection
psql -h localhost -U postgres -d blacktop_blackout_dev
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Database connection error:**
   ```bash
   sudo service postgresql start
   ```

2. **Build failures:**
   ```bash
   npm install
   npm run build
   ```

3. **Port conflicts:**
   ```bash
   # Kill processes on ports 3000/3333
   sudo lsof -ti:3000 | xargs kill -9
   sudo lsof -ti:3333 | xargs kill -9
   ```

### Get Help

- **Documentation**: `/docs/` directory
- **API Docs**: `/docs/api/README.md`
- **Deployment Guide**: `/docs/deployment/DEPLOYMENT_GUIDE.md`

---

## 🎯 Next Steps

1. **Change default passwords**
2. **Configure your API keys**
3. **Set up SSL certificates for production**
4. **Import your existing project data**
5. **Train your team on the system**

---

**🏆 You're all set! Welcome to Blacktop Blackout!** 🛣️✨