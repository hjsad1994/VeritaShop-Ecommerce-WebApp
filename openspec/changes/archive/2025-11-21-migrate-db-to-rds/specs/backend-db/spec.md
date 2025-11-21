# Specification: Database Connection

## ADDED Requirements

### Requirement: Cloud Database Connectivity
The system MUST connect to the managed Amazon RDS PostgreSQL instance.

#### Scenario: Application Start
- **Given** the application is configured with valid RDS credentials in `.env`
- **When** the backend service starts
- **Then** it should successfully establish a connection pool to the `verita_db` database
- **And** execute database queries without timeout or authentication errors.

#### Scenario: Data Persistence
- **Given** a user places an order
- **When** the order data is saved
- **Then** the record must be persisted to the RDS instance `verita_db`
- **And** be visible to other connections immediately (ACID compliance).

### Requirement: Secure Configuration
The system MUST allow configuration of database host, user, password, and port via environment variables.

#### Scenario: Configuration Change
- **Given** the `DATABASE_URL` is updated
- **When** the application is restarted
- **Then** it connects to the new target defined in the URL.
