# Implementation Tasks: Migrate Database to Local PostgreSQL

## 1. Pre-Migration Preparation
- [ ] 1.1 Verify Docker is installed on all development machines
- [ ] 1.2 Document current AWS RDS connection details for rollback reference
- [ ] 1.3 Backup current RDS database (optional, if data preservation needed): `pg_dump -h database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com -U postgres -d verita_db > backup_$(date +%Y%m%d).sql`
- [ ] 1.4 Create feature branch: `git checkout -b main#migrate-db-to-local`
- [ ] 1.5 Review existing docker-compose.yml PostgreSQL configuration

## 2. Docker Compose Configuration
- [ ] 2.1 Update `docker-compose.yml` port mapping from `5436:5432` to `5432:5432`
- [ ] 2.2 Add PostgreSQL healthcheck configuration:
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U user -d nextecommerce"]
    interval: 10s
    timeout: 5s
    retries: 5
  ```
- [ ] 2.3 Add environment variables for timezone and locale if needed
- [ ] 2.4 Configure PostgreSQL performance settings (shared_buffers, work_mem) for development
- [ ] 2.5 Ensure volume `postgres-data` is properly configured for persistence
- [ ] 2.6 Add restart policy: `restart: unless-stopped` for development convenience
- [ ] 2.7 Test Docker Compose configuration: `docker-compose up postgres`
- [ ] 2.8 Verify PostgreSQL container starts successfully and passes health checks

## 3. Backend Dockerfile Creation
- [ ] 3.1 Create `backend/Dockerfile` with Node.js 20 Alpine base image
- [ ] 3.2 Set working directory to `/app`
- [ ] 3.3 Copy package.json and package-lock.json first (layer caching)
- [ ] 3.4 Run `npm ci --only=production` for dependency installation
- [ ] 3.5 Copy application source code
- [ ] 3.6 Run `npx prisma generate` to create Prisma Client
- [ ] 3.7 Expose port 5000
- [ ] 3.8 Set CMD to `["npm", "start"]`
- [ ] 3.9 Create `backend/.dockerignore` excluding `node_modules`, `.env`, `dist`, `*.log`
- [ ] 3.10 Test Docker build: `docker build -t veritashop-backend ./backend`
- [ ] 3.11 Test backend container connection to PostgreSQL: `docker-compose up`

## 4. Environment Configuration Update
- [ ] 4.1 Update `backend/.env` DATABASE_URL from AWS RDS to local format:
  ```
  DATABASE_URL="postgresql://user:password@localhost:5432/nextecommerce?schema=public"
  ```
- [ ] 4.2 Remove or comment out AWS RDS credentials from `backend/.env`
- [ ] 4.3 Create `backend/.env.example` with documentation:
  - Local development format
  - Production format (placeholder)
  - Mark RDS fields as deprecated
- [ ] 4.4 Update `backend/src/config/index.ts` validation if needed (no changes expected)
- [ ] 4.5 Verify no hardcoded RDS references in source code: `grep -r "database-1.cjy40k02q315" backend/src/`
- [ ] 4.6 Update frontend `.env` if NEXT_PUBLIC_API_URL needs adjustment (likely unchanged)

## 5. Database Initialization
- [ ] 5.1 Start PostgreSQL container: `docker-compose up -d postgres`
- [ ] 5.2 Wait for container health check to pass: `docker-compose ps`
- [ ] 5.3 Run Prisma migrations: `cd backend && npx prisma migrate deploy`
- [ ] 5.4 Verify migration success: check for errors in output
- [ ] 5.5 Run database seed: `npx prisma db seed` (if seed script exists)
- [ ] 5.6 Verify seed data: Connect with psql or GUI tool and check tables
- [ ] 5.7 Test backend connection: `npm run dev` in backend directory
- [ ] 5.8 Verify backend logs show successful database connection

## 6. CI/CD Workflow Updates
- [ ] 6.1 Review `.github/workflows/backend-ci.yml` PostgreSQL service configuration
- [ ] 6.2 Update DATABASE_URL in workflow environment variables to use service container:
  ```yaml
  DATABASE_URL: postgresql://testuser:testpassword@localhost:5432/veritashop_test
  ```
- [ ] 6.3 Ensure PostgreSQL service health checks are configured properly
- [ ] 6.4 Update `npx prisma migrate deploy` step to run against CI database
- [ ] 6.5 Remove any references to external database connections in workflows
- [ ] 6.6 Update `frontend-ci.yml` if any database-related steps exist (likely none)
- [ ] 6.7 Add comments explaining CI database setup for future maintainers

## 7. Testing and Validation
- [ ] 7.1 Run backend linter: `cd backend && npm run lint --if-present`
- [ ] 7.2 Run TypeScript type check: `npx tsc --noEmit`
- [ ] 7.3 Run backend tests: `npm test --if-present`
- [ ] 7.4 Test Prisma schema validation: `npx prisma validate`
- [ ] 7.5 Test database connection from backend: start dev server and make API request
- [ ] 7.6 Manual smoke test: User registration/login
- [ ] 7.7 Manual smoke test: Product browsing and cart operations
- [ ] 7.8 Manual smoke test: Admin panel access and inventory management
- [ ] 7.9 Test database reset: `npx prisma migrate reset` and verify clean state
- [ ] 7.10 Verify Docker volume persistence: restart container and check data remains

## 8. CI/CD Pipeline Validation
- [ ] 8.1 Push feature branch to GitHub
- [ ] 8.2 Monitor backend CI workflow execution in GitHub Actions
- [ ] 8.3 Verify PostgreSQL service starts successfully in CI
- [ ] 8.4 Check CI logs for database connection errors
- [ ] 8.5 Verify all migrations apply successfully in CI environment
- [ ] 8.6 Verify TypeScript compilation succeeds
- [ ] 8.7 Verify linting passes
- [ ] 8.8 Verify tests pass (if present)
- [ ] 8.9 Fix any CI failures and push corrections
- [ ] 8.10 Confirm green CI pipeline before proceeding

## 9. Documentation Updates
- [ ] 9.1 Update main `README.md` with Docker setup instructions
- [ ] 9.2 Document PostgreSQL connection steps for new developers
- [ ] 9.3 Create troubleshooting section for common Docker issues:
  - Port conflicts on 5432
  - Docker not running
  - Volume permission issues
  - Connection timeout errors
- [ ] 9.4 Document database reset procedure: `docker-compose down -v && docker-compose up postgres`
- [ ] 9.5 Update `backend/README.md` with new environment variable format
- [ ] 9.6 Document GUI tool connection instructions (pgAdmin, DBeaver)
- [ ] 9.7 Add migration rollback procedure to docs
- [ ] 9.8 Document data backup/restore procedure using pg_dump/pg_restore

## 10. Security and Cleanup
- [ ] 10.1 Verify no AWS RDS credentials remain in tracked files: `git grep "Aa0908700714"`
- [ ] 10.2 Verify no AWS RDS hostnames remain in code: `git grep "database-1.cjy40k02q315"`
- [ ] 10.3 Check `.env` files are in `.gitignore`
- [ ] 10.4 Remove AWS RDS-related environment variables from CI secrets (if any)
- [ ] 10.5 Update project documentation to reflect local-first approach
- [ ] 10.6 Ensure `.env.example` does not contain real credentials

## 11. Deployment and Team Communication
- [ ] 11.1 Create pull request with comprehensive description
- [ ] 11.2 Link to this OpenSpec change proposal in PR description
- [ ] 11.3 Request code review from team leads
- [ ] 11.4 Address review feedback and update proposal if needed
- [ ] 11.5 Notify team in Slack/Discord about upcoming migration
- [ ] 11.6 Prepare migration guide for team members:
  ```bash
  git pull origin main
  docker-compose down -v
  docker-compose up -d postgres
  cd backend
  npx prisma migrate deploy
  npx prisma db seed
  npm run dev
  ```
- [ ] 11.7 Merge PR after approval
- [ ] 11.8 Monitor for issues in team Slack/support channel
- [ ] 11.9 Be available for troubleshooting during team transition
- [ ] 11.10 Schedule follow-up meeting to gather feedback

## 12. Post-Deployment Verification
- [ ] 12.1 Verify all team members successfully migrated to local database
- [ ] 12.2 Monitor CI/CD pipeline for stability over 3-5 days
- [ ] 12.3 Check for any performance regressions or issues
- [ ] 12.4 Collect feedback on developer experience improvement
- [ ] 12.5 Update OpenSpec status: mark change as complete
- [ ] 12.6 Archive AWS RDS connection details in project wiki (for emergency reference only)
- [ ] 12.7 Consider decommissioning AWS RDS development instance to save costs
- [ ] 12.8 Document lessons learned for future infrastructure changes

## Rollback Plan (If Needed)
- [ ] R.1 Revert `backend/.env` to AWS RDS connection string
- [ ] R.2 Revert `docker-compose.yml` port changes
- [ ] R.3 Revert `.github/workflows/backend-ci.yml` to previous version
- [ ] R.4 Notify team of rollback
- [ ] R.5 Document root cause of failure
- [ ] R.6 Create issue for retry with lessons learned

## Dependencies
- Tasks 2.* must complete before 3.*
- Tasks 4.* must complete before 5.*
- Tasks 5.* must complete before 7.*
- Tasks 7.* must complete before 8.*
- Tasks 8.* must pass before 11.* (deployment)

## Estimated Timeline
- Pre-Migration Preparation: 1 hour
- Docker & Backend Setup: 3 hours
- Environment & Database Init: 2 hours
- CI/CD Updates: 2 hours
- Testing & Validation: 3 hours
- Documentation: 2 hours
- Security & Cleanup: 1 hour
- Deployment & Communication: 2 hours
- **Total: ~16 hours (2 working days)**

## Success Criteria
✅ Local PostgreSQL runs in Docker on port 5432
✅ Backend connects to local database successfully
✅ All Prisma migrations apply without errors
✅ CI/CD pipeline passes with containerized PostgreSQL
✅ No AWS RDS credentials in codebase
✅ All team members migrated successfully
✅ Developer experience improved (faster, offline capable)
✅ Documentation updated and comprehensive
