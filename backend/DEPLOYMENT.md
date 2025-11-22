# Deployment Guide - Les Rois des Bois Backend

## Quick Start Guide

### Option 1: Docker Deployment (Recommended)

1. **Prerequisites**:
   - Docker and Docker Compose installed
   - Copy `.env.example` to `.env` and configure

2. **Start Services**:
   ```bash
   cd backend
   docker-compose up --build -d
   ```

3. **Seed Database**:
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access**:
   - API: http://localhost:5000
   - API Docs: http://localhost:5000/api/docs
   - Health: http://localhost:5000/health

### Option 2: Local Development

1. **Prerequisites**:
   - Node.js 18+
   - MongoDB running locally or remote

2. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Seed Database**:
   ```bash
   npm run seed
   ```

5. **Start Server**:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Production Deployment

### Environment Variables (Critical)

```env
# Production values - CHANGE THESE!
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-different-strong-secret>
MONGO_URI=<your-production-mongodb-uri>

# Optional but recommended
SMTP_HOST=<your-smtp-host>
SMTP_USER=<your-smtp-user>
SMTP_PASSWORD=<your-smtp-password>
```

### Generate Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Setup

**Option A: MongoDB Atlas (Recommended)**
1. Create cluster at https://cloud.mongodb.com
2. Get connection string
3. Set as `MONGO_URI` in `.env`

**Option B: Self-hosted MongoDB**
1. Install MongoDB 7.0+
2. Configure authentication
3. Create database `les-rois-des-bois`
4. Set connection string

### File Storage

**Development**: Uses local filesystem (`./uploads`, `./pdfs`)

**Production Options**:
1. **Local**: Mount persistent volumes (Docker)
2. **AWS S3**: Configure S3 credentials in `.env`
   ```env
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=<your-key>
   AWS_SECRET_ACCESS_KEY=<your-secret>
   AWS_S3_BUCKET=<your-bucket>
   ```

### SSL/HTTPS

Use reverse proxy (Nginx, Caddy):

**Nginx Example**:
```nginx
server {
    listen 443 ssl;
    server_name api.lesroisdebois.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Scaling

**Horizontal Scaling** (Multiple Instances):
```bash
docker-compose up --scale backend=3 -d
```

**Load Balancer** (Nginx):
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### Monitoring

**Health Checks**:
```bash
curl http://localhost:5000/health
```

**Logs**:
```bash
# Docker
docker-compose logs -f backend

# Local
tail -f logs/app.log
```

**Recommended Tools**:
- **Error Tracking**: Sentry (configure SENTRY_DSN)
- **Performance**: New Relic, DataDog
- **Uptime**: UptimeRobot, Pingdom

### Backups

**MongoDB Backups**:
```bash
# Backup
mongodump --uri="mongodb://user:pass@host/les-rois-des-bois" --out=/backups

# Restore
mongorestore --uri="mongodb://user:pass@host/les-rois-des-bois" /backups/les-rois-des-bois
```

**File Storage Backups**:
- Local: Regular filesystem backups
- S3: Enable versioning and lifecycle policies

### Security Checklist

- [ ] Strong JWT secrets configured
- [ ] MongoDB authentication enabled
- [ ] HTTPS/SSL configured
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] File upload limits set
- [ ] Error messages don't expose secrets
- [ ] Dependencies updated regularly

## Connecting to Frontend

### API Base URL

**Development**: `http://localhost:5000/api`
**Production**: `https://api.lesroisdebois.com/api`

### Authentication Flow

1. Login: `POST /api/auth/login`
   ```json
   {
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. Get tokens: `accessToken`, `refreshToken`

3. Include in requests:
   ```
   Authorization: Bearer <accessToken>
   ```

4. Refresh when expired: `POST /api/auth/refresh`

### Sample Frontend Code (React)

```javascript
// api.js
const API_BASE = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken
      });
      localStorage.setItem('accessToken', data.data.accessToken);
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MONGO_URI is correct
- Ensure MongoDB is running
- Check firewall rules
- Verify network access (Atlas IP whitelist)

**JWT Token Errors**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure consistent secrets across instances

**File Upload Issues**
- Check STORAGE_PATH directory exists
- Verify file permissions
- Check MAX_FILE_SIZE limit

**PDF Generation Fails**
- Ensure PDF_PATH directory exists
- Check font availability for Arabic
- Verify disk space

### Logs

Check logs for errors:
```bash
# Application logs
cat logs/app.log

# Docker logs
docker-compose logs backend

# MongoDB logs
docker-compose logs mongodb
```

### Support

For issues:
1. Check logs
2. Review environment variables
3. Consult README.md
4. Contact support@lesroisdebois.com

## Performance Tips

1. **Database Indexes**: Already configured in models
2. **Caching**: Use Redis for session storage
3. **CDN**: Serve static files via CDN
4. **Compression**: Enable gzip in reverse proxy
5. **Connection Pooling**: MongoDB default pooling active

## Maintenance

**Regular Tasks**:
- Update dependencies: `npm update`
- Review logs weekly
- Monitor disk space
- Check error rates
- Review audit logs
- Backup verification

**Updates**:
```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```
