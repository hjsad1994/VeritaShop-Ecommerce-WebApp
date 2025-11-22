# Change: Migrate Database from Cloud RDS to Local PostgreSQL

## Why
The current setup uses Amazon RDS PostgreSQL hosted in the cloud (`database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com`), which introduces external dependencies, recurring costs, network latency, and potential availability concerns during development. Migrating to a local PostgreSQL instance running in Docker will improve development velocity, reduce cloud costs, eliminate network dependencies, and provide full control over the database environment while maintaining consistency across all environments through Docker Compose.

## What Changes
- **BREAKING**: Replace cloud-hosted Amazon RDS PostgreSQL with local Docker-based PostgreSQL 13
- **BREAKING**: Update `DATABASE_URL` environment variable to point to local PostgreSQL instance
- Remove AWS RDS credentials and connection strings from environment configuration
- Enhance `docker-compose.yml` to include production-ready PostgreSQL service configuration
- Add Dockerfile for backend service to enable containerized deployment
- Update CI/CD workflows to use local PostgreSQL service instead of cloud database
- Add database initialization scripts and volume persistence configuration
- Update environment variable documentation and configuration examples
- Ensure all Prisma migrations and seeds work with local PostgreSQL
- Validate CI/CD pipeline passes with new local database setup

## Impact

### Affected Specs
- `backend-db`: Complete replacement of cloud database connectivity with local PostgreSQL

### Affected Code
- `backend/.env`: DATABASE_URL connection string
- `backend/src/config/index.ts`: Database configuration validation
- `docker-compose.yml`: PostgreSQL service configuration
- `.github/workflows/backend-ci.yml`: CI database setup
- `.github/workflows/frontend-ci.yml`: Indirect impact through API URL
- `backend/prisma/schema.prisma`: Connection string reference (no schema changes)
- Backend service startup and connection pool initialization
- README files and developer setup documentation

### Migration Path
1. Backup existing RDS database if needed for data preservation
2. Update `docker-compose.yml` with enhanced PostgreSQL configuration
3. Create Dockerfile for backend service
4. Update `.env` files with new local connection string
5. Run `docker-compose up` to start local PostgreSQL
6. Execute Prisma migrations: `npx prisma migrate deploy`
7. Seed database: `npx prisma db seed`
8. Update CI/CD workflows to use Docker services
9. Validate all tests pass with local database
10. Remove AWS RDS credentials from environment files

### Breaking Changes
- **DATABASE_URL format changes**: From cloud RDS connection string to local Docker connection
- **AWS credentials removal**: `AWS_RDS_*` related credentials no longer needed
- **Network requirements**: No longer requires internet connectivity for database operations
- **Local Docker requirement**: Developers must have Docker installed and running

### Benefits
- Zero network latency for database operations
- No cloud costs for development database
- Full control over database version and configuration
- Consistent development environment across team members
- Faster CI/CD pipeline execution
- Ability to work offline
- Simplified local debugging and development

### Risks
- Initial setup requires Docker installation for all developers
- Potential data migration complexity if preserving production data
- Team members must update local environment configuration
