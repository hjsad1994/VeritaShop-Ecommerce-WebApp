# Design: Fix Local PostgreSQL Database Setup

## Context
The VeritaShop backend uses Prisma ORM to connect to a PostgreSQL 13 database running in a Docker container. The current docker-compose.yml configuration sets environment variables but the PostgreSQL container fails to properly initialize the user role, resulting in authentication failures when the Express backend attempts to connect.

**Root Cause Analysis:**
1. Docker container is running (verified by `docker ps`)
2. Environment variables are set correctly in docker-compose.yml
3. However, executing `psql -U user` inside the container returns "role 'user' does not exist"
4. This indicates PostgreSQL initialization did not create the user role despite POSTGRES_USER being set

**Common PostgreSQL Docker Issues:**
- Corrupted volume data from previous failed initialization
- PostgreSQL initialization only runs on first start with empty data directory
- If volume has existing data, environment variables are ignored

## Goals / Non-Goals

### Goals
- Fix PostgreSQL user role creation in Docker container
- Ensure database is ready before backend connection attempts
- Provide clear verification steps for developers
- Make setup reliable across Windows development environments
- Preserve data persistence across container restarts

### Non-Goals
- Migrate to different database system
- Change from Docker to hosted database
- Modify Prisma schema structure
- Update authentication mechanism beyond fixing connection

## Decisions

### Decision 1: Recreate Container with Clean Volume
**Chosen approach:** Force recreate PostgreSQL container with fresh volume

**Rationale:**
- PostgreSQL initialization scripts only run on first start with empty volume
- Existing volume likely has corrupted initialization state
- Clean slate ensures proper user/database creation

**Implementation:**
```bash
docker-compose down -v              # Stop and remove volumes
docker-compose up -d postgres       # Fresh start with initialization
```

### Decision 2: Add Health Check to docker-compose.yml
**Chosen approach:** Use pg_isready in healthcheck

**Rationale:**
- Backend should wait for database to be ready
- Prevents race condition where backend starts before PostgreSQL accepts connections
- Standard PostgreSQL health check pattern

**Configuration:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U user -d nextecommerce"]
  interval: 5s
  timeout: 5s
  retries: 5
```

**Alternatives considered:**
- Custom initialization script: More complex, adds maintenance burden
- Wait-for-it script: External dependency, not needed with healthcheck
- Sleep timer: Unreliable, wastes time

### Decision 3: Use Explicit Service Dependencies
**Chosen approach:** Add `depends_on` with health condition if backend added to docker-compose

**Rationale:**
- Ensures backend doesn't start until PostgreSQL is healthy
- Built-in Docker Compose feature
- No custom scripting needed

**Note:** Currently backend runs outside Docker with `npm run dev`, so this is documentation for future containerization.

### Decision 4: Verify Permissions in Initialization
**Chosen approach:** Add manual verification steps in tasks, not automated script

**Rationale:**
- One-time setup issue, not recurring
- Developer needs to understand the fix
- Automated script adds complexity for minimal benefit

## Technical Details

### PostgreSQL Environment Variable Behavior
When PostgreSQL Docker container starts with empty data directory:
1. Checks for POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
2. Creates superuser role with POSTGRES_USER name
3. Creates database with POSTGRES_DB name
4. Sets password for the user
5. Grants all privileges on database to user

If data directory exists, ALL environment variables are IGNORED.

### DATABASE_URL Format
Current format in .env:
```
postgresql://user:password@127.0.0.1:5436/nextecommerce
```

Components:
- **user**: PostgreSQL role name (must match POSTGRES_USER)
- **password**: Role password (must match POSTGRES_PASSWORD)
- **127.0.0.1**: Localhost (Windows compatibility, avoid 'localhost')
- **5436**: Host port mapping from 5432 container port
- **nextecommerce**: Database name (must match POSTGRES_DB)

### Windows-Specific Considerations
- Use 127.0.0.1 instead of localhost (Windows hosts file issues)
- Port 5436 avoids conflicts with other PostgreSQL installations
- Volume persistence works differently on Windows Docker Desktop

## Risks / Trade-offs

### Risk: Data Loss During Volume Recreation
**Mitigation:**
- Document that this is initial setup, no production data exists
- If data exists, backup first: `docker exec <container> pg_dump -U user nextecommerce > backup.sql`
- Restore after recreation: `docker exec -i <container> psql -U user nextecommerce < backup.sql`

### Risk: Port 5436 Already in Use
**Mitigation:**
- Check with: `netstat -ano | findstr 5436`
- Document how to change port in both docker-compose.yml and .env
- Verify port consistency across configuration files

### Risk: Docker Volume Permissions on Windows
**Mitigation:**
- Use named volumes (already implemented: `postgres-data`)
- Document Docker Desktop settings if permissions issues occur
- Fallback: Use bind mount with explicit path if needed

## Migration Plan

### Step 1: Backup Current State (if needed)
```bash
# Only if existing data needs preservation
docker exec veritashop-ecommerce-webapp-postgres-1 pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### Step 2: Stop and Clean Container
```bash
docker-compose down -v
docker volume ls                    # Verify postgres-data removed
docker volume prune -f              # Clean orphaned volumes
```

### Step 3: Update Configuration
- Update docker-compose.yml with healthcheck
- Verify .env DATABASE_URL matches docker-compose.yml credentials

### Step 4: Restart with Fresh Initialization
```bash
docker-compose up -d postgres
docker-compose logs -f postgres     # Watch initialization
```

### Step 5: Verify Database Connection
```bash
# Test 1: Check container health
docker ps                           # Status should show "healthy"

# Test 2: Connect via psql
docker exec veritashop-ecommerce-webapp-postgres-1 psql -U user -d nextecommerce -c "\dt"

# Test 3: Test from host
docker exec veritashop-ecommerce-webapp-postgres-1 psql -U user -d nextecommerce -c "SELECT version();"
```

### Step 6: Run Prisma Migrations
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### Step 7: Start Backend
```bash
cd backend
npm run dev                         # Should connect successfully
```

### Rollback
If issues persist after recreation:
1. Check Docker Desktop logs for PostgreSQL errors
2. Verify environment variables: `docker exec <container> env | grep POSTGRES`
3. Try explicit initialization script (escalation path in tasks)
4. Consider PostgreSQL version compatibility issues

## Verification Steps

### Success Indicators
✅ Container status shows "healthy"
✅ `psql -U user` connects without "role does not exist"
✅ Backend logs show "Database connected successfully"
✅ Prisma migrations execute without errors
✅ Data persists after `docker-compose restart`

### Failure Indicators
❌ Container status stuck at "starting"
❌ "role 'user' does not exist" still appears
❌ Backend logs show connection timeout
❌ Prisma cannot generate client

## Open Questions

**Q: Should we add the backend service to docker-compose.yml?**
A: Out of scope for this change. Current setup runs backend with `npm run dev` for hot reload. Containerization is a separate architectural decision.

**Q: Should we add pgAdmin or similar database UI?**
A: Not required for this fix. Can be added as separate enhancement if team needs GUI management.

**Q: Should we upgrade to PostgreSQL 14 or 15?**
A: No, maintain PostgreSQL 13 for consistency with production/previous RDS version. Upgrade is separate change.

**Q: Should we add connection pooling?**
A: Out of scope. Prisma already handles connection management. Pooling relevant only at scale.
