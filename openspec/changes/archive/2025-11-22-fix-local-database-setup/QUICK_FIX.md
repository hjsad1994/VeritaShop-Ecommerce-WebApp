# Quick Fix Guide: Database Connection Error

## Problem
```
[ERROR]: Failed to start server:
User `user` was denied access on the database `nextecommerce.public`
```

## Root Cause
PostgreSQL Docker container has corrupted initialization state. The user role was never created because the container started with an existing volume, and PostgreSQL only runs initialization scripts on first start with an empty data directory.

## Quick Solution (5 minutes)

### Step 1: Clean Restart
```bash
# Stop and remove container with volumes
docker-compose down -v

# Verify volume is removed
docker volume ls
# (postgres-data should NOT appear in the list)
```

### Step 2: Fresh Start
```bash
# Start PostgreSQL with clean initialization
docker-compose up -d postgres

# Watch the logs (wait for "ready to accept connections")
docker-compose logs -f postgres
```

### Step 3: Verify Database
```bash
# Check container is healthy
docker ps
# Look for STATUS column showing "healthy"

# Test database connection
docker exec veritashop-ecommerce-webapp-postgres-1 psql -U user -d nextecommerce -c "SELECT version();"
# Should show PostgreSQL version without errors
```

### Step 4: Run Migrations
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Step 5: Start Backend
```bash
npm run dev
# Should see: "Database connected successfully"
```

## If Still Not Working

### Check 1: Volume Actually Removed?
```bash
# Force remove if still exists
docker volume rm veritashop-ecommerce-webapp_postgres-data

# Or use prune
docker volume prune -f
```

### Check 2: Port Conflict?
```bash
# Check if port 5436 is in use
netstat -ano | findstr 5436

# If in use, either:
# - Kill the process using that port
# - Change port in docker-compose.yml AND backend/.env
```

### Check 3: Environment Variables Correct?
Verify in `docker-compose.yml`:
```yaml
environment:
  POSTGRES_USER: user          # Must match DATABASE_URL
  POSTGRES_PASSWORD: password   # Must match DATABASE_URL
  POSTGRES_DB: nextecommerce   # Must match DATABASE_URL
```

Verify in `backend/.env`:
```
DATABASE_URL="postgresql://user:password@127.0.0.1:5436/nextecommerce"
```

### Check 4: Docker Desktop Running?
- Open Docker Desktop
- Ensure it's running and not showing errors
- Check Settings → Resources → ensure enough memory allocated (at least 2GB)

## Why This Happens

PostgreSQL Docker images use initialization scripts that only run when:
1. Container starts for the first time, AND
2. The data directory (`/var/lib/postgresql/data`) is empty

If you've started the container before with incorrect settings, or if initialization was interrupted, the volume persists the broken state. Environment variables like `POSTGRES_USER` are then **ignored** on subsequent starts.

The only way to fix it: remove the volume and let PostgreSQL initialize fresh.

## Prevention

Always use `docker-compose down -v` when changing database configuration to force clean initialization.
