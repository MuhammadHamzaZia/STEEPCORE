# STEEPCOREAPI - Production Setup Guide

## Overview

This guide provides complete instructions for setting up STEEPCOREAPI in a production environment. The API is a .NET 10 AI-driven learning roadmap generator that integrates with:
- **Google Gemini AI** for content generation and embeddings
- **Stripe** for payment processing
- **PostgreSQL** for data persistence
- **JWT** for authentication

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Gemini AI Configuration](#gemini-ai-configuration)
4. [Stripe Payment Configuration](#stripe-payment-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Deployment](#deployment)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **.NET 10 SDK** - Download from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **PostgreSQL 14+** - Download from [https://www.postgresql.org/download](https://www.postgresql.org/download)
- **pgvector Extension** - Required for vector-based semantic search
- **git** - Download from [https://git-scm.com/download](https://git-scm.com/download)

### Required Accounts
- **Google Cloud Account** - For Gemini API access
- **Stripe Account** - For payment processing
- **Production Web Server** - Linux (Ubuntu/Debian recommended) or Windows Server

### System Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 50GB+ SSD
- **Network**: Static IP address, port 443 (HTTPS)

---

## Database Setup

### 1. PostgreSQL Installation

#### On Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verify installation
psql --version
```

#### On Windows:
1. Download PostgreSQL installer from [https://www.postgresql.org/download/windows](https://www.postgresql.org/download/windows)
2. Run the installer and follow the setup wizard
3. Remember the superuser (postgres) password
4. Complete the installation

### 2. Install pgvector Extension

```bash
# On Ubuntu/Debian
sudo apt install postgresql-14-pgvector  # (replace 14 with your version)

# On all systems, connect to PostgreSQL and run:
sudo -u postgres psql
```

```sql
-- Connect to your database
\c steepcoredb_prod

-- Create the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Exit
\q
```

### 3. Create Production Database

```bash
# Connect as postgres superuser
sudo -u postgres psql

# Create the database
CREATE DATABASE steepcoredb_prod
	WITH
	ENCODING = 'UTF8'
	LOCALE = 'en_US.UTF-8'
	TEMPLATE = template0;

# Create a dedicated database user
CREATE USER steepcoreuser WITH ENCRYPTED PASSWORD 'your-very-secure-password-here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE steepcoredb_prod TO steepcoreuser;
ALTER ROLE steepcoreuser WITH CREATEDB;

# Exit
\q
```

### 4. Configure PostgreSQL Security

Edit `/etc/postgresql/14/main/postgresql.conf` (path may vary):

```bash
# Set listen address for network access
listen_addresses = 'localhost, 0.0.0.0'

# Or for local only (recommended with SSH tunnel)
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:

```
# For local connections only (secure)
host    steepcoredb_prod    steepcoreuser    127.0.0.1/32    md5
host    steepcoredb_prod    steepcoreuser    ::1/128         md5

# For network access (use with strong passwords)
host    steepcoredb_prod    steepcoreuser    10.0.0.0/8      md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 5. Verify Database Connection

```bash
# Test connection
psql -h localhost -U steepcoreuser -d steepcoredb_prod -c "SELECT 1;"

# Expected output: (1 row with value 1)
```

---

## Gemini AI Configuration

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `SteepCoreAPI-Prod`
5. Click "CREATE"

### 2. Enable Required APIs

In the Google Cloud Console:

1. Click "APIs & Services" > "Library"
2. Search for "Generative Language API"
3. Click on it and press "ENABLE"
4. Wait for it to enable

### 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you may restrict it to specific APIs)
4. **Save this key securely** - you'll need it in your environment configuration

### 4. Test Gemini API

```bash
# Test the API key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
	"contents": [{
	  "parts": [{"text": "Hello"}]
	}]
  }'

# Should receive a successful response with generated content
```

### 5. API Pricing & Quotas

- **Free Tier**: 60 requests per minute, some models free
- **Paid Plans**: Available with Pay-As-You-Go billing
- **Quotas**: Available in [Google Cloud Console](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)

For production:
1. Go to "APIs & Services" > "Credentials"
2. Click on your API Key
3. Add restrictions (Optional):
   - Restrict key to Generative Language API only
   - Restrict to specific IP addresses

---

## Stripe Payment Configuration

### 1. Create Stripe Account

1. Visit [https://stripe.com](https://stripe.com)
2. Click "Sign up" 
3. Complete the registration process
4. Verify your email and business information

### 2. Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" > "API Keys" in the left sidebar
3. You'll see two keys:
   - **Publishable Key** (pk_live_...)
   - **Secret Key** (sk_live_...)

**IMPORTANT**: Use LIVE keys only in production. Use TEST keys only in development.

### 3. Create a Webhook Endpoint

1. In Stripe Dashboard, go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing Secret** (whsec_...)

### 4. Store Credentials

Save the following in your production environment:

```
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 5. Test Stripe Integration

```bash
# Test with a test card (development only)
curl -X POST https://api.stripe.com/v1/payment_intents \
  -u sk_test_your_test_key: \
  -d amount=2000 \
  -d currency=usd \
  -d "payment_method_types[]"=card
```

---

## Environment Configuration

### 1. Create Production Environment File

On your production server, create `/opt/steepcoreapi/.env.production`:

```bash
# Database Configuration
DB_CONNECTION_STRING="Host=localhost;Port=5432;Database=steepcoredb_prod;Username=steepcoreuser;Password=your-db-password;SSL Mode=Require;"

# JWT Configuration
JWT_SECRET="your-production-jwt-secret-minimum-32-characters-change-this-to-something-secure"
JWT_ISSUER="https://api.yourdomain.com"
JWT_AUDIENCE="SteepCoreAPI"

# Gemini AI Configuration
GEMINI_API_KEY="your-google-gemini-api-key"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_your_stripe_live_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Frontend Configuration
FRONTEND_URL="https://app.yourdomain.com"

# Additional Origins (optional, comma-separated)
ADDITIONAL_ORIGINS="https://admin.yourdomain.com"

# Environment
ASPNETCORE_ENVIRONMENT="Production"
```

### 2. Create appsettings.Production.json

The file already exists at `STEEPCOREAPI/appsettings.Production.json` with environment variable placeholders.

### 3. Load Environment Variables

#### Option A: Manual Configuration (Recommended for Security)

```bash
# Set environment variables for the application
export DB_CONNECTION_STRING="..."
export JWT_SECRET="..."
export GEMINI_API_KEY="..."
# ... etc

# Run the application
dotnet STEEPCOREAPI.dll
```

#### Option B: Using .env File with systemd

Create `/etc/systemd/system/steepcoreapi.service`:

```ini
[Unit]
Description=SteepCoreAPI Production Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=notify
User=steepcoreapi
WorkingDirectory=/opt/steepcoreapi
EnvironmentFile=/opt/steepcoreapi/.env.production
ExecStart=/usr/bin/dotnet /opt/steepcoreapi/STEEPCOREAPI.dll
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 4. Alternative: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["STEEPCOREAPI.csproj", "."]
RUN dotnet restore "STEEPCOREAPI.csproj"
COPY . .
RUN dotnet publish -c Release -o /app

FROM base
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "STEEPCOREAPI.dll"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
	build: .
	ports:
	  - "443:443"
	environment:
	  - DB_CONNECTION_STRING=Host=postgres;Port=5432;Database=steepcoredb_prod;Username=steepcoreuser;Password=${DB_PASSWORD};
	  - ASPNETCORE_ENVIRONMENT=Production
	  - JWT_SECRET=${JWT_SECRET}
	  - GEMINI_API_KEY=${GEMINI_API_KEY}
	  - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
	depends_on:
	  - postgres

  postgres:
	image: pgvector/pgvector:0.5.1-pg14
	environment:
	  POSTGRES_DB: steepcoredb_prod
	  POSTGRES_USER: steepcoreuser
	  POSTGRES_PASSWORD: ${DB_PASSWORD}
	volumes:
	  - postgres_data:/var/lib/postgresql/data
	ports:
	  - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

## Deployment

### 1. Build the Application

```bash
cd STEEPCOREAPI
dotnet publish -c Release -o ./publish
```

### 2. Copy to Production Server

```bash
# From local machine to production server
scp -r ./publish/* user@prod-server.com:/opt/steepcoreapi/

# Set permissions
ssh user@prod-server.com "sudo chown -R steepcoreapi:steepcoreapi /opt/steepcoreapi"
ssh user@prod-server.com "sudo chmod -R 755 /opt/steepcoreapi"
```

### 3. Set Up SSL Certificate (HTTPS)

Using Let's Encrypt with Nginx reverse proxy:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Request certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Certificate stored in: /etc/letsencrypt/live/api.yourdomain.com/
```

### 4. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/steepcoreapi`:

```nginx
upstream dotnet_app {
	server localhost:5000;
}

server {
	listen 80;
	server_name api.yourdomain.com;

	# Redirect HTTP to HTTPS
	return 301 https://$server_name$request_uri;
}

server {
	listen 443 ssl;
	server_name api.yourdomain.com;

	# SSL Configuration
	ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
	ssl_protocols TLSv1.2 TLSv1.3;
	ssl_ciphers HIGH:!aNULL:!MD5;
	ssl_prefer_server_ciphers on;

	# Proxy configuration
	location / {
		proxy_pass http://dotnet_app;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_read_timeout 60s;
	}

	# Health check endpoint
	location /health {
		proxy_pass http://dotnet_app;
		access_log off;
	}
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/steepcoreapi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Start the Application

#### Using systemd:
```bash
sudo systemctl enable steepcoreapi
sudo systemctl start steepcoreapi
sudo systemctl status steepcoreapi
```

#### Using command line:
```bash
cd /opt/steepcoreapi
dotnet STEEPCOREAPI.dll
```

### 6. Apply Database Migrations

The application auto-applies migrations on startup. To manually apply:

```bash
cd STEEPCOREAPI
dotnet ef database update --configuration Release
```

---

## Security Considerations

### 1. Database Security

✅ **Do:**
- Use strong, randomly generated passwords (min 20 characters)
- Enable SSL connections to database
- Use separate user accounts with minimal permissions
- Enable PostgreSQL query logging
- Regular backups with encryption

❌ **Don't:**
- Use default passwords
- Expose database on public internet
- Allow remote root access
- Store passwords in code
- Use production data in development

### 2. API Security

✅ **Do:**
- Use HTTPS only (enforce in production)
- Implement rate limiting
- Validate all input
- Use strong JWT secrets (min 32 characters)
- Rotate JWT secrets regularly
- Implement CORS properly
- Use environment variables for secrets

❌ **Don't:**
- Send credentials in URLs
- Store secrets in code or `.gitignore` files
- Use default Jwt:Secret in production
- Allow public access to admin endpoints
- Disable SSL verification

### 3. API Key Security

✅ **Do:**
- Store keys in environment variables only
- Use separate keys for each environment (dev/staging/prod)
- Rotate API keys regularly
- Monitor API key usage
- Restrict API key permissions/scope
- Use IP whitelisting where possible

❌ **Don't:**
- Commit API keys to git
- Share keys via email
- Use the same key across environments
- Log full API keys
- Grant unnecessary permissions

### 4. Stripe Security

✅ **Do:**
- Verify webhook signatures
- Use LIVE keys only in production
- Store webhook secret securely
- Implement webhook retries
- Monitor for fraud

❌ **Don't:**
- Log card numbers (PCI compliance)
- Store unencrypted payment details
- Use TEST keys in production
- Skip webhook verification

### 5. Gemini API Security

✅ **Do:**
- Restrict API key to specific IPs
- Monitor API usage for anomalies
- Set spending quotas
- Implement request signing
- Log API calls (non-sensitive data only)

❌ **Don't:**
- Share API keys
- Use API keys in client-side code
- Skip input validation

### 6. Network Security

```bash
# Enable firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 10.0.0.0/8 to any port 5432  # PostgreSQL (internal only)
```

### 7. Application Secrets Management

Use a secrets management solution:

**Option 1: Azure Key Vault**
```csharp
builder.Configuration.AddAzureKeyVault(
	new Uri($"https://{keyVaultName}.vault.azure.net/"),
	new ClientSecretCredential(tenantId, clientId, clientSecret));
```

**Option 2: HashiCorp Vault**
```bash
# Store secrets
vault write secret/steepcoreapi/prod \
  db_password=xxx \
  jwt_secret=xxx \
  gemini_api_key=xxx
```

**Option 3: Docker Secrets** (for Docker deployments)
```bash
echo "your-secret-value" | docker secret create jwt_secret -
```

---

## Monitoring and Logging

### 1. Application Logging

Update `appsettings.Production.json`:

```json
{
  "Logging": {
	"LogLevel": {
	  "Default": "Warning",
	  "Microsoft": "Warning",
	  "STEEPCOREAPI": "Information"
	},
	"Console": {
	  "IncludeScopes": false
	}
  }
}
```

### 2. Structured Logging with Serilog (Recommended)

Install:
```bash
dotnet add package Serilog
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.MSSqlServer
```

Configure in `Program.cs`:
```csharp
Log.Logger = new LoggerConfiguration()
	.MinimumLevel.Warning()
	.WriteTo.File("/var/log/steepcoreapi/log-.txt", rollingInterval: RollingInterval.Day)
	.WriteTo.Console()
	.CreateLogger();

builder.Host.UseSerilog();
```

### 3. Health Check Monitoring

Health endpoints available:
- `/health` - Basic health check
- `/health/ready` - Database connectivity check

Monitor with:
```bash
# Check status
curl https://api.yourdomain.com/health

# Response should be: {"status":"healthy","timestamp":"...","environment":"Production"}
```

### 4. Performance Monitoring

Set up application performance monitoring (APM):

**Option 1: Application Insights**
```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

**Option 2: Prometheus + Grafana**
```csharp
builder.Services.AddPrometheusMetrics();
```

### 5. Log Aggregation

Centralize logs using:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **CloudWatch** (if using AWS)
- **Azure Monitor** (if using Azure)

Example with Splunk:
```bash
# Forward syslog to Splunk
echo "*.info   @@splunk-server:514" >> /etc/rsyslog.conf
sudo systemctl restart rsyslog
```

---

## Troubleshooting

### Issue: "JWT secret is not configured"

**Solution:**
```bash
# Verify JWT_SECRET environment variable is set
echo $JWT_SECRET

# If not set:
export JWT_SECRET="your-production-jwt-secret"

# Restart application
sudo systemctl restart steepcoreapi
```

### Issue: "DefaultConnection is not configured"

**Solution:**
```bash
# Check database connection string
echo $DB_CONNECTION_STRING

# Test connection
psql "$DB_CONNECTION_STRING" -c "SELECT 1;"

# If fails, verify:
# 1. PostgreSQL is running: sudo systemctl status postgresql
# 2. Database exists: psql -l | grep steepcoredb_prod
# 3. User has permissions: sudo -u postgres psql -c "\du steepcoreuser"
```

### Issue: "Gemini API key not configured" or "401 Unauthorized"

**Solution:**
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test API key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# If fails:
# 1. Check if API is enabled in Google Cloud Console
# 2. Verify API key has correct permissions
# 3. Check if API key is restricted to Generative Language API
```

### Issue: "Stripe API returned 401"

**Solution:**
```bash
# Verify Stripe keys
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# Test Stripe key
curl https://api.stripe.com/v1/charges \
  -u $STRIPE_SECRET_KEY: \
  -d limit=1

# If fails:
# 1. Ensure using LIVE keys (sk_live_, pk_live_) in production
# 2. Check if key is still valid in Stripe dashboard
# 3. Verify key permissions
```

### Issue: Database migrations fail

**Solution:**
```bash
# Check PostgreSQL logs
sudo tail -50 /var/log/postgresql/postgresql.log

# Manually check database connection
sudo -u postgres psql -d steepcoredb_prod -c "SELECT version();"

# Run migrations manually
cd /opt/steepcoreapi
dotnet ef database update

# If pgvector not found:
sudo -u postgres psql -d steepcoredb_prod -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Issue: SSL certificate error

**Solution:**
```bash
# Verify certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx SSL configuration
sudo nginx -t

# View certificate details
openssl x509 -in /etc/letsencrypt/live/api.yourdomain.com/cert.pem -text -noout
```

### Issue: 503 Service Unavailable

**Solution:**
```bash
# Check application status
sudo systemctl status steepcoreapi

# View application logs
sudo journalctl -u steepcoreapi -n 50

# Check if listening on port
sudo netstat -tlnp | grep dotnet

# Restart application
sudo systemctl restart steepcoreapi

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

---

## Backup and Disaster Recovery

### Database Backup

```bash
# Full backup
sudo -u postgres pg_dump steepcoredb_prod > /backups/steepcoredb_prod_$(date +%Y%m%d).sql

# Compressed backup
sudo -u postgres pg_dump -Fc steepcoredb_prod > /backups/steepcoredb_prod_$(date +%Y%m%d).dump

# Automated daily backup
# Add to crontab: 0 2 * * * /home/backup/backup_db.sh
```

### Restore Database

```bash
# From SQL backup
sudo -u postgres psql steepcoredb_prod < /backups/steepcoredb_prod_20240101.sql

# From custom format backup
sudo -u postgres pg_restore -d steepcoredb_prod /backups/steepcoredb_prod_20240101.dump
```

### Application Backup

```bash
# Backup application files
tar -czf /backups/steepcoreapi_$(date +%Y%m%d).tar.gz /opt/steepcoreapi/

# Keep last 7 days of backups
find /backups -name "steepcoreapi_*.tar.gz" -mtime +7 -delete
```

---

## Support and Resources

**Documentation:**
- [.NET 10 Docs](https://learn.microsoft.com/en-us/dotnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

**API References:**
- [Gemini API](https://ai.google.dev)
- [Stripe API](https://stripe.com/docs/api)
- [JWT.io](https://jwt.io)

**Community:**
- GitHub Issues: Include repository link
- Stack Overflow: Tag with `dotnet`, `postgresql`, `stripe`
- Discord Communities: .NET and PostgreSQL communities

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready ✅
