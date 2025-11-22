# backend-db Specification Changes

## MODIFIED Requirements

### Requirement: Local Database Connectivity
The system MUST connect to a local PostgreSQL instance running in Docker.

#### Scenario: Application Start with Docker Database
- **Given** the application is configured with local PostgreSQL credentials in `.env`
- **And** Docker Compose is running the PostgreSQL service
- **When** the backend service starts
- **Then** it should successfully establish a connection pool to the `nextecommerce` database at `localhost:5432`
- **And** execute database queries without timeout or authentication errors

#### Scenario: Data Persistence in Local Environment
- **Given** a user places an order in the local development environment
- **When** the order data is saved
- **Then** the record must be persisted to the local PostgreSQL Docker container
- **And** be visible to other connections immediately (ACID compliance)
- **And** survive container restarts via Docker volume persistence

#### Scenario: Offline Development
- **Given** the developer has no internet connectivity
- **And** Docker is running locally
- **When** the backend service connects to the database
- **Then** all database operations should succeed without requiring external network access

#### Scenario: Database Reset for Clean State
- **Given** the local database contains test data
- **When** the developer runs `npx prisma migrate reset`
- **Then** the database schema should be dropped and recreated
- **And** all migrations should be reapplied
- **And** seed data should be inserted

### Requirement: Docker Compose Integration
The system MUST use Docker Compose to manage the local PostgreSQL service.

#### Scenario: Starting Database Service
- **Given** Docker is installed and running
- **When** the developer runs `docker-compose up postgres`
- **Then** a PostgreSQL 13 container should start
- **And** be accessible on port 5432
- **And** pass health checks before accepting connections

#### Scenario: Data Volume Persistence
- **Given** the PostgreSQL container is running with volume `postgres-data`
- **When** data is written to the database
- **And** the container is stopped and restarted
- **Then** all previously written data should remain intact

#### Scenario: Database Container Health
- **Given** the PostgreSQL container is starting
- **When** Docker Compose executes health checks
- **Then** the container should report healthy status once `pg_isready` succeeds
- **And** the backend service should wait for health confirmation before connecting

### Requirement: Secure Configuration
The system MUST allow configuration of database host, user, password, and port via environment variables.

#### Scenario: Configuration Change for Local Development
- **Given** the `DATABASE_URL` is set to `postgresql://user:password@localhost:5432/nextecommerce?schema=public`
- **When** the application is restarted
- **Then** it connects to the local Docker PostgreSQL instance

#### Scenario: CI/CD Environment Configuration
- **Given** GitHub Actions workflow defines a PostgreSQL service container
- **And** the `DATABASE_URL` environment variable is set to the service container
- **When** the CI pipeline runs
- **Then** the backend tests should connect to the ephemeral PostgreSQL instance
- **And** all migrations and tests should execute successfully

## REMOVED Requirements

### Requirement: Cloud Database Connectivity
**Reason**: Migrating from AWS RDS to local Docker-based PostgreSQL to eliminate cloud dependencies, reduce costs, and improve development velocity.

**Migration**: Update `DATABASE_URL` in `.env` from AWS RDS connection string to local Docker format. Backup RDS data if preservation is needed via `pg_dump`, then restore to local instance via `pg_restore` or use Prisma seed scripts.

## ADDED Requirements

### Requirement: Containerized Backend Service
The backend application MUST support running in a Docker container for consistent deployment.

#### Scenario: Backend Docker Build
- **Given** a Dockerfile exists in the backend directory
- **When** the developer runs `docker build -t veritashop-backend ./backend`
- **Then** the Docker image should build successfully
- **And** include all dependencies and Prisma Client generation

#### Scenario: Backend Container Startup
- **Given** the backend Docker image is built
- **And** the PostgreSQL service is running
- **When** the backend container starts with correct environment variables
- **Then** it should connect to the PostgreSQL service
- **And** expose the API on port 5000

### Requirement: CI/CD PostgreSQL Service
The CI/CD pipeline MUST use containerized PostgreSQL services instead of external databases.

#### Scenario: GitHub Actions PostgreSQL Service
- **Given** the workflow defines a PostgreSQL service container with test credentials
- **When** the CI job starts
- **Then** PostgreSQL should be available at `localhost:5432`
- **And** pass health checks before tests begin
- **And** provide an isolated database for each workflow run

#### Scenario: Automated Migration in CI
- **Given** the PostgreSQL service is healthy in CI
- **When** the workflow runs `npx prisma migrate deploy`
- **Then** all migrations should apply successfully to the test database
- **And** the database schema should match the Prisma schema exactly

#### Scenario: Test Database Isolation
- **Given** multiple CI workflow runs execute concurrently
- **When** each workflow uses its own PostgreSQL service container
- **Then** database operations in one workflow should not affect others
- **And** each workflow should have a clean, isolated test database

### Requirement: Development Environment Consistency
All developers MUST use the same PostgreSQL version and configuration via Docker.

#### Scenario: Consistent Database Version
- **Given** Docker Compose specifies PostgreSQL 13 image
- **When** any developer runs `docker-compose up postgres`
- **Then** the exact same PostgreSQL version should be used across all machines
- **And** eliminate "works on my machine" database version issues

#### Scenario: Shared Configuration Standards
- **Given** Docker Compose defines standard database credentials and settings
- **When** developers join the project
- **Then** they should use the same database configuration
- **And** require zero manual PostgreSQL installation or setup
