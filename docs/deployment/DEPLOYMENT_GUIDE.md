# Blacktop Blackout Deployment Guide

## Overview

This guide covers deployment options for the Blacktop Blackout asphalt maintenance management platform.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: 18.x or later
- **PostgreSQL**: 12.x or later

### Recommended Production Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: 20.x LTS
- **PostgreSQL**: 15.x with PostGIS 3.x

## Quick Deploy (Automated)

### Option 1: Single Command Deployment

```bash
# Clone the repository
git clone <repository-url>
cd blacktop-blackout-monorepo

# Run automated deployment
./deploy.sh
```

The deploy script will:
1. Install all dependencies
2. Set up PostgreSQL database
3. Initialize database schema
4. Build all applications
5. Start services
6. Configure nginx (optional)

### Option 2: Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t blacktop-blackout .
docker run -d -p 3000:3000 -p 3333:3333 blacktop-blackout
```

## Manual Deployment

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL and PostGIS
sudo apt install -y postgresql postgresql-contrib postgresql-client
sudo apt install -y postgresql-17-postgis-3

# Install additional tools
sudo apt install -y nginx git curl wget
```

### Step 2: Database Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb blacktop_blackout_production
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your-secure-password';"

# Enable PostGIS
sudo -u postgres psql -d blacktop_blackout_production -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Step 3: Application Setup

```bash
# Create application user
sudo useradd -m -s /bin/bash blacktop
sudo su - blacktop

# Clone repository
git clone <repository-url> /home/blacktop/app
cd /home/blacktop/app

# Install dependencies
npm install --production

# Build applications
npm run build
```

### Step 4: Environment Configuration

```bash
# Copy and configure environment
cp .env.example .env.production
nano .env.production
```

**Required environment variables:**
```bash
NODE_ENV=production
API_PORT=3333
WEB_PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=blacktop_blackout_production
DB_USER=postgres
DB_PASSWORD=your-secure-password

JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=8h

# Add your actual API keys
WEATHER_API_KEY=your-weather-api-key
MAPS_API_KEY=your-google-maps-key
```

### Step 5: Database Initialization

```bash
# Initialize database schema
npm run init:db

# Run migrations (if any)
npm run migrate
```

### Step 6: Service Configuration

Create systemd service files:

```bash
# API Service
sudo nano /etc/systemd/system/blacktop-api.service
```

```ini
[Unit]
Description=Blacktop Blackout API
After=network.target postgresql.service

[Service]
Type=simple
User=blacktop
WorkingDirectory=/home/blacktop/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/apps/api/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=blacktop-api

[Install]
WantedBy=multi-user.target
```

```bash
# Web Service
sudo nano /etc/systemd/system/blacktop-web.service
```

```ini
[Unit]
Description=Blacktop Blackout Web Server
After=network.target

[Service]
Type=simple
User=blacktop
WorkingDirectory=/home/blacktop/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/npx serve -s dist/apps/web-app -p 3000
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=blacktop-web

[Install]
WantedBy=multi-user.target
```

Enable and start services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable blacktop-api blacktop-web
sudo systemctl start blacktop-api blacktop-web
```

### Step 7: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/blacktop-blackout
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:3333/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/blacktop-blackout /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

## Cloud Deployment

### AWS Deployment

1. **EC2 Instance Setup**
   - Launch Ubuntu 22.04 LTS instance
   - Security groups: 80, 443, 22
   - Elastic IP address

2. **RDS PostgreSQL**
   - Create PostgreSQL 15.x instance
   - Enable PostGIS in parameter group
   - Configure security group for EC2 access

3. **S3 for File Storage**
   - Create bucket for file uploads
   - Configure IAM role for EC2 access

4. **CloudFront (Optional)**
   - CDN for static assets
   - SSL termination

### Digital Ocean Deployment

1. **Droplet Creation**
   - Ubuntu 22.04 on Standard plan
   - 2GB+ RAM recommended

2. **Managed Database**
   - PostgreSQL with PostGIS
   - Automatic backups enabled

3. **Spaces for File Storage**
   - Object storage for uploads
   - CDN integration

## Monitoring and Logging

### Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'blacktop-api',
      script: 'dist/apps/api/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    }
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/blacktop
```

```
/home/blacktop/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 blacktop blacktop
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up basic monitoring script
nano /home/blacktop/monitor.sh
```

```bash
#!/bin/bash
# Basic health check script
curl -f http://localhost:3333/health || pm2 restart blacktop-api
```

## Backup and Recovery

### Database Backup

```bash
# Create backup script
nano /home/blacktop/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/blacktop/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres blacktop_blackout_production > $BACKUP_DIR/db_backup_$DATE.sql

# Keep last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

### File Backup

```bash
# Backup uploaded files
rsync -av /home/blacktop/app/uploads/ /backup/uploads/
```

## Security Hardening

### Firewall Configuration

```bash
# UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Application Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Limit database user permissions
   - Enable SSL connections

3. **File Upload Security**
   - Validate file types
   - Scan for malware
   - Set size limits

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U postgres -d blacktop_blackout_production
   ```

2. **Service Not Starting**
   ```bash
   # Check logs
   sudo journalctl -u blacktop-api -f
   
   # Check permissions
   sudo chown -R blacktop:blacktop /home/blacktop/app
   ```

3. **High Memory Usage**
   ```bash
   # Check Node.js processes
   ps aux | grep node
   
   # Restart services
   sudo systemctl restart blacktop-api
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_projects_company_id ON projects(company_id);
   CREATE INDEX idx_scans_project_id ON pavement_scans(project_id);
   ```

2. **Application Optimization**
   - Enable gzip compression in nginx
   - Use PM2 cluster mode
   - Implement Redis for caching

## Support

For deployment support:
- **Email**: deploy-support@blacktopsolutions.com
- **Documentation**: https://docs.blacktopsolutions.com/deployment
- **Status**: https://status.blacktopsolutions.com