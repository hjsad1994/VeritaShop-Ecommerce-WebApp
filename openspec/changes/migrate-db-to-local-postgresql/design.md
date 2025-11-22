# Design: Migrate Database from Cloud RDS to Local PostgreSQL

## Context

The VeritaShop e-commerce platform currently relies on Amazon RDS PostgreSQL hosted in AWS (`database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com:5432`). This introduces:

1. **External Dependencies**: Requires internet connectivity and AWS availability for development
2. **Cost Overhead**: Ongoing cloud infrastructure costs for development instances
3. **Performance Latency**: Network round-trip time adds 50-200ms per query
4. **Environment Complexity**: Different connection strings between local and production
5. **CI/CD Overhead**: GitHub Actions must connect to remote database, adding time and complexity

The project already uses Docker Compose with a PostgreSQL service definition, but it's configured on port 5436 and not actively used. The backend connects directly to AWS RDS instead.

**Stakeholders**:
- Development team (faster local development)
- DevOps/CI team (simplified pipeline configuration)
- Project budget owner (reduced cloud costs)

**Constraints**:
- Must maintain PostgreSQL 13 compatibility
- Cannot break existing Prisma schema or migrations
- CI/CD pipeline must remain functional
- Zero data loss for critical development/staging data

## Goals / Non-Goals

### Goals
1. Eliminate AWS RDS dependency for local development environment
2. Use Docker Compose as single source of truth for local infrastructure
3. Ensure CI/CD pipeline uses containerized PostgreSQL services
4. Maintain 100% compatibility with existing Prisma schema and migrations
5. Provide clear migration documentation for team members
6. Enable offline development capability
7. Reduce database operation latency from 50-200ms to <5ms

### Non-Goals
- Changing the production database architecture (this change targets dev/test only)
- Modifying Prisma schema structure or relationships
- Implementing database backup/restore automation
- Adding database monitoring or observability tools
- Changing PostgreSQL version (staying on v13)
- Supporting multiple database providers beyond PostgreSQL

## Decisions

### Decision 1: Use Docker Compose for Local PostgreSQL
**What**: Define PostgreSQL as a Docker service in `docker-compose.yml` with production-like configuration.

**Why**: 
- Docker Compose is already in the project and team is familiar with it
- Provides consistent environment across all developer machines
- Matches the CI/CD service configuration pattern
- Allows version pinning and reproducible builds
- No additional tools or learning curve

**Alternatives Considered**:
- **Native PostgreSQL installation**: Rejected because it requires manual installation, version management varies by OS, and creates environment inconsistency
- **Cloud-based dev database (Supabase, Neon)**: Rejected because it doesn't solve the internet dependency or latency issues
- **SQLite for development**: Rejected because PostgreSQL-specific features (schemas, types) would break

### Decision 2: Create Dockerfile for Backend Service
**What**: Add a `backend/Dockerfile` to containerize the Node.js backend application.

**Why**:
- Enables full Docker Compose orchestration (backend + database)
- Matches modern deployment patterns
- Simplifies CI/CD testing in isolated environments
- Provides path to container-based production deployment

**Configuration**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

### Decision 3: Update DATABASE_URL Format
**What**: Change from AWS RDS connection string to local Docker service reference.

**From**:
```
DATABASE_URL="postgresql://postgres:Aa0908700714@database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com:5432/verita_db?schema=public"
```

**To**:
```
DATABASE_URL="postgresql://user:password@localhost:5432/nextecommerce?schema=public"
```

**Why**:
- Localhost points to Docker Compose service via port mapping
- Simpler credentials for local development (user/password)
- Database name matches docker-compose.yml definition (nextecommerce)
- Schema parameter remains consistent

**Alternative**: 
- Service name (`postgres`) instead of `localhost`: Rejected because it only works inside Docker network, not for local `npm run dev` outside containers

### Decision 4: Preserve Port 5432 for Standard PostgreSQL
**What**: Change docker-compose port mapping from `5436:5432` to `5432:5432`.

**Why**:
- Standard PostgreSQL port improves developer experience
- Removes confusion about which port to use
- Most PostgreSQL tools default to 5432
- Reduces documentation burden

**Alternative**:
- Keep port 5436: Rejected to avoid non-standard configuration

### Decision 5: CI/CD Uses Service Containers
**What**: GitHub Actions workflows define PostgreSQL as a service container instead of connecting to external database.

**Why**:
- Eliminates external dependencies in CI pipeline
- Faster pipeline execution (no network latency)
- No secrets management for database credentials
- Each workflow run gets fresh, isolated database
- Already implemented in `backend-ci.yml` (just needs activation)

**Configuration**:
```yaml
services:
  postgres:
    image: postgres:13
    env:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: veritashop_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### Decision 6: Remove AWS RDS Credentials
**What**: Delete AWS RDS connection strings and credentials from `.env` files.

**Why**:
- Reduces security risk of credential exposure
- Simplifies environment configuration
- Eliminates confusion about which database is active
- AWS credentials for S3/CloudFront remain (separate concern)

**Migration**: Document RDS connection details in project wiki before removal for emergency recovery.

## Technical Architecture

### Component Diagram

```
┌─────────────────────────────────────────────┐
│         Docker Compose Environment          │
│                                             │
│  ┌──────────────┐       ┌───────────────┐  │
│  │   Backend    │       │  PostgreSQL   │  │
│  │  (Node.js)   │──────▶│      13       │  │
│  │  Port: 5000  │       │  Port: 5432   │  │
│  └──────────────┘       └───────────────┘  │
│         │                      │            │
│         │                      │            │
└─────────┼──────────────────────┼────────────┘
          │                      │
          ▼                      ▼
    ┌──────────┐          ┌──────────┐
    │ Frontend │          │  Volume  │
    │(Next.js) │          │postgres- │
    │ Port:3000│          │   data   │
    └──────────┘          └──────────┘
```

### Data Flow

1. **Local Development**:
   - Developer runs `docker-compose up postgres`
   - Backend connects via `localhost:5432`
   - Prisma Client queries local PostgreSQL
   - Data persists in Docker volume `postgres-data`

2. **CI/CD Pipeline**:
   - GitHub Actions starts PostgreSQL service container
   - Backend tests connect to `localhost:5432`
   - Fresh database for each workflow run
   - No data persistence needed (ephemeral)

3. **Migration Execution**:
   - Run `npx prisma migrate deploy` against local database
   - All existing migrations apply cleanly (no schema changes)
   - Run `npx prisma db seed` to populate test data

### Configuration Changes

| File | Current | New | Reason |
|------|---------|-----|--------|
| `docker-compose.yml` | Port 5436, minimal config | Port 5432, enhanced config | Standard port, production-ready settings |
| `backend/.env` | AWS RDS URL | Local Docker URL | Remove cloud dependency |
| `backend-ci.yml` | External DB reference | Service container | Isolated, faster CI |
| `backend/Dockerfile` | N/A | New file | Enable containerization |

### Volume Strategy

**Persistent Data** (local development):
```yaml
volumes:
  postgres-data:
    driver: local
```
- Data survives container restarts
- Cleared only on explicit volume removal
- Backup via `pg_dump` if needed

**Ephemeral Data** (CI/CD):
- No volume mounting
- Fresh database per workflow run
- Migrations applied automatically
- Seeded data optional for integration tests

## Risks / Trade-offs

### Risk 1: Docker Dependency
**Risk**: Team members without Docker experience may struggle with setup.

**Impact**: Medium (one-time setup cost)

**Mitigation**:
1. Provide step-by-step Docker installation guide in README
2. Create troubleshooting section for common Docker issues
3. Offer office hours or pairing sessions for setup help
4. Document Windows/Mac/Linux-specific gotchas

### Risk 2: Data Migration Complexity
**Risk**: If production data needs to be migrated to local environment, process could be complex.

**Impact**: Low (not required for most development)

**Mitigation**:
1. Document `pg_dump` / `pg_restore` procedure
2. Provide sanitized production data snapshot (optional)
3. Default to using Prisma seed data for development
4. No production data required for feature development

### Risk 3: Port Conflicts
**Risk**: Developers may have PostgreSQL already running on port 5432.

**Impact**: Low (easy to detect and resolve)

**Mitigation**:
1. Docker Compose will fail fast with clear error message
2. Document how to stop conflicting services
3. Alternative: Allow port override via environment variable
4. Pre-flight check script: `lsof -i :5432` on Mac/Linux

### Risk 4: CI/CD Pipeline Changes
**Risk**: Modified workflows could break the CI/CD pipeline.

**Impact**: High (blocks all PRs)

**Mitigation**:
1. Test workflow changes in a feature branch first
2. GitHub Actions already has PostgreSQL service configured (just activating it)
3. Validate with a dummy PR before merge
4. Keep RDS credentials documented as rollback option (temporary)

### Risk 5: Performance Differences
**Risk**: Local PostgreSQL may behave differently than RDS (query plans, indexes).

**Impact**: Low (PostgreSQL 13 is consistent)

**Mitigation**:
1. Use identical PostgreSQL version (13)
2. Match RDS configuration parameters where relevant
3. Run full test suite to detect anomalies
4. Production environment remains unchanged (RDS or managed service)

### Trade-off: Local Storage Requirements
**Gain**: Faster development, offline capability, zero cloud costs

**Cost**: ~500MB-2GB local disk space for Docker image + volume

**Justification**: Modern development machines have sufficient storage, and benefits far outweigh minimal disk usage.

## Migration Plan

### Phase 1: Preparation (1 hour)
1. Backup current RDS database (if data preservation needed):
   ```bash
   pg_dump -h database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com \
           -U postgres -d verita_db > backup_$(date +%Y%m%d).sql
   ```
2. Document RDS connection details in project wiki
3. Verify all team members have Docker installed
4. Create feature branch: `main#migrate-db-to-local`

### Phase 2: Docker Configuration (2 hours)
1. Update `docker-compose.yml`:
   - Change port from 5436 to 5432
   - Add healthcheck configuration
   - Configure PostgreSQL performance settings
   - Add volume persistence

2. Create `backend/Dockerfile`:
   - Base image: `node:20-alpine`
   - Install dependencies and generate Prisma client
   - Expose port 5000

3. Create `backend/.dockerignore`:
   - Exclude `node_modules`, `.env`, `dist`

### Phase 3: Environment Configuration (1 hour)
1. Update `backend/.env`:
   - Change `DATABASE_URL` to local format
   - Remove or comment out RDS credentials
   - Add Docker connection string

2. Create `backend/.env.example`:
   - Document both local and production URL formats
   - Mark RDS fields as deprecated

3. Update frontend `.env` if needed (should be unaffected)

### Phase 4: CI/CD Update (2 hours)
1. Update `.github/workflows/backend-ci.yml`:
   - Ensure PostgreSQL service is active (already configured)
   - Update DATABASE_URL environment variable
   - Add database initialization steps

2. Test workflow in feature branch:
   - Push to feature branch
   - Verify CI pipeline passes
   - Check logs for connection errors

### Phase 5: Validation (2 hours)
1. Local testing:
   ```bash
   docker-compose up postgres
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```

2. Run test suite:
   ```bash
   npm test
   npx tsc --noEmit
   ```

3. Verify frontend can connect:
   ```bash
   cd frontend
   npm run dev
   ```

4. Manual smoke tests:
   - User login/logout
   - Product browsing
   - Cart operations
   - Admin panel access

### Phase 6: Documentation (1 hour)
1. Update main README with Docker setup instructions
2. Create troubleshooting guide for common issues
3. Document rollback procedure (if needed)
4. Update team wiki with migration guide

### Phase 7: Deployment
1. Merge feature branch to main
2. Team members pull latest changes
3. Run setup script:
   ```bash
   docker-compose down -v  # Clean old setup
   docker-compose up -d postgres
   cd backend && npx prisma migrate deploy && npx prisma db seed
   ```

### Rollback Plan
If critical issues arise:
1. Revert `.env` to use AWS RDS connection string
2. Revert `docker-compose.yml` changes
3. Revert CI/CD workflow changes
4. Document issue for future retry

**Rollback time**: ~15 minutes

## Open Questions

1. **Q**: Should we maintain separate databases for different feature branches?
   **A**: No, single local database is sufficient. Developers can reset with `npx prisma migrate reset` if needed.

2. **Q**: Do we need database backups for local development?
   **A**: Not required. Prisma seed script recreates test data. Production backups handled separately.

3. **Q**: Should we containerize the frontend as well?
   **A**: Out of scope for this change. Frontend can run via `npm run dev` on host machine.

4. **Q**: What about database GUI tools (pgAdmin, DBeaver)?
   **A**: They can connect to `localhost:5432` with credentials from docker-compose.yml. No special configuration needed.

5. **Q**: Should we add a separate test database?
   **A**: CI/CD uses ephemeral test database. Local development can use `nextecommerce` database. Separate test database not needed at this time.
