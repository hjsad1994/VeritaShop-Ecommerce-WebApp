# Specification: Local Development Environment

## ADDED Requirements

### Requirement: PostgreSQL Docker Container Initialization
The local development environment SHALL provide a PostgreSQL database container that initializes correctly with proper user roles and database permissions on first startup.

#### Scenario: Fresh container initialization with clean volume
- **GIVEN** no existing PostgreSQL container or volume exists
- **WHEN** developer runs `docker-compose up -d postgres`
- **THEN** the container SHALL create a superuser role matching POSTGRES_USER environment variable
- **AND** the container SHALL create a database matching POSTGRES_DB environment variable
- **AND** the user SHALL have full privileges on the created database
- **AND** the container SHALL accept connections on the mapped host port (5436)

#### Scenario: Container initialization with existing corrupted volume
- **GIVEN** an existing postgres-data volume with corrupted initialization state
- **WHEN** developer runs `docker-compose down -v` followed by `docker-compose up -d postgres`
- **THEN** the volume SHALL be removed completely
- **AND** a fresh initialization SHALL occur as if starting from scratch
- **AND** the user role SHALL be created successfully

#### Scenario: Verification of user role creation
- **GIVEN** the PostgreSQL container is running
- **WHEN** developer executes `docker exec <container> psql -U user -d nextecommerce -c "\du"`
- **THEN** the output SHALL show the 'user' role exists
- **AND** the role SHALL have SUPERUSER privileges
- **AND** the role SHALL be able to connect to the nextecommerce database

### Requirement: Database Health Monitoring
The PostgreSQL Docker container SHALL include health check monitoring to verify the database is ready to accept connections before dependent services attempt to connect.

#### Scenario: Health check reports database ready
- **GIVEN** the PostgreSQL container has finished initialization
- **WHEN** Docker executes the health check command `pg_isready -U user -d nextecommerce`
- **THEN** the health check SHALL return success status
- **AND** the container status SHALL show as "healthy"
- **AND** dependent services SHALL wait for healthy status before starting

#### Scenario: Health check detects database not ready
- **GIVEN** the PostgreSQL container is still initializing
- **WHEN** Docker executes the health check command
- **THEN** the health check SHALL return failure status
- **AND** the container status SHALL show as "starting" or "unhealthy"
- **AND** Docker SHALL retry the health check according to configured interval and retries

#### Scenario: Backend waits for database health
- **GIVEN** the PostgreSQL container is starting up
- **WHEN** the backend application attempts to connect
- **THEN** the backend SHALL wait for the database to be ready
- **OR** the backend SHALL retry connection with appropriate backoff
- **AND** clear error messages SHALL be logged if database is unreachable

### Requirement: Database Connection String Configuration
The backend application SHALL use a properly formatted DATABASE_URL that matches the PostgreSQL Docker container configuration for successful authentication and connection.

#### Scenario: Valid DATABASE_URL format
- **GIVEN** docker-compose.yml defines POSTGRES_USER=user, POSTGRES_PASSWORD=password, POSTGRES_DB=nextecommerce
- **WHEN** backend/.env contains `DATABASE_URL="postgresql://user:password@127.0.0.1:5436/nextecommerce"`
- **THEN** Prisma Client SHALL connect successfully to the database
- **AND** authentication SHALL succeed without "access denied" errors
- **AND** the backend SHALL log "Database connected successfully"

#### Scenario: DATABASE_URL credentials mismatch
- **GIVEN** docker-compose.yml and .env have different usernames or passwords
- **WHEN** the backend application attempts to connect
- **THEN** the connection SHALL fail with clear authentication error
- **AND** the error message SHALL indicate credential mismatch
- **AND** the developer SHALL be able to identify the configuration issue

#### Scenario: DATABASE_URL host and port configuration
- **GIVEN** PostgreSQL container maps port 5432 to host port 5436
- **WHEN** DATABASE_URL uses 127.0.0.1:5436 as the host and port
- **THEN** the connection SHALL succeed from the host machine
- **AND** the connection SHALL work on Windows development environments
- **AND** the connection SHALL not conflict with other PostgreSQL installations

### Requirement: Prisma Migration Execution
The development environment SHALL support running Prisma migrations against the local PostgreSQL database to set up the application schema without authentication or permission errors.

#### Scenario: Initial migration on fresh database
- **GIVEN** a newly initialized PostgreSQL container with no tables
- **WHEN** developer runs `npm run prisma:migrate` from the backend directory
- **THEN** Prisma SHALL connect successfully using DATABASE_URL
- **AND** all migration files SHALL be executed in order
- **AND** tables SHALL be created according to the schema.prisma file
- **AND** the _prisma_migrations table SHALL record the migration history

#### Scenario: Migration with existing schema
- **GIVEN** a database with previously applied migrations
- **WHEN** developer runs `npm run prisma:migrate`
- **THEN** Prisma SHALL detect already-applied migrations
- **AND** only new pending migrations SHALL be executed
- **AND** no duplicate table creation errors SHALL occur
- **AND** the schema SHALL be up to date with schema.prisma

#### Scenario: Prisma Client generation
- **GIVEN** a valid DATABASE_URL and schema.prisma file
- **WHEN** developer runs `npm run prisma:generate`
- **THEN** the Prisma Client SHALL be generated successfully
- **AND** TypeScript types SHALL be available for all database models
- **AND** the backend application SHALL be able to import and use @prisma/client

### Requirement: Data Persistence Across Container Restarts
The PostgreSQL Docker container SHALL persist all database data across container restarts and system reboots using a named Docker volume.

#### Scenario: Data survives container restart
- **GIVEN** the database contains tables and data
- **WHEN** developer runs `docker-compose restart postgres`
- **THEN** all tables SHALL remain intact after restart
- **AND** all data records SHALL be preserved
- **AND** the backend SHALL reconnect successfully
- **AND** no re-initialization SHALL occur

#### Scenario: Data survives system reboot
- **GIVEN** the database contains tables and data
- **WHEN** the developer's machine is rebooted
- **AND** Docker Desktop restarts
- **AND** the container is restarted with `docker-compose up -d postgres`
- **THEN** the postgres-data volume SHALL be mounted
- **AND** all previous data SHALL be accessible
- **AND** no re-initialization SHALL overwrite existing data

#### Scenario: Volume removal forces fresh initialization
- **GIVEN** any database state exists
- **WHEN** developer runs `docker-compose down -v`
- **THEN** the postgres-data volume SHALL be deleted
- **AND** all data SHALL be permanently removed
- **AND** next `docker-compose up` SHALL perform fresh initialization
- **AND** a new empty database SHALL be created

### Requirement: Database Setup Verification
The development environment SHALL provide clear verification steps to confirm the PostgreSQL database is correctly initialized and accessible before starting application development.

#### Scenario: Verify container health status
- **GIVEN** the PostgreSQL container is running
- **WHEN** developer runs `docker ps`
- **THEN** the container status column SHALL show "healthy"
- **AND** the container SHALL show uptime without restarts
- **AND** port mapping SHALL display 0.0.0.0:5436->5432/tcp

#### Scenario: Verify database connection from inside container
- **GIVEN** the PostgreSQL container is running and healthy
- **WHEN** developer runs `docker exec <container> psql -U user -d nextecommerce -c "SELECT version();"`
- **THEN** the command SHALL succeed without authentication errors
- **AND** PostgreSQL version information SHALL be displayed
- **AND** the connection SHALL complete within 2 seconds

#### Scenario: Verify schema tables exist
- **GIVEN** Prisma migrations have been executed
- **WHEN** developer runs `docker exec <container> psql -U user -d nextecommerce -c "\dt"`
- **THEN** the output SHALL list all tables from schema.prisma
- **AND** tables SHALL include User, Product, Order, Cart, Inventory, etc.
- **AND** the public schema SHALL be the default schema

#### Scenario: Verify backend application connectivity
- **GIVEN** the database is healthy and schema is applied
- **WHEN** developer runs `npm run dev` in the backend directory
- **THEN** the backend logs SHALL display "Database connected successfully"
- **AND** the server SHALL start without database connection errors
- **AND** API endpoints SHALL be able to query the database
- **AND** the health check endpoint SHALL return success
