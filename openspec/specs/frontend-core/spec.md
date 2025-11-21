# frontend-core Specification

## Purpose
TBD - created by archiving change fix-frontend-type-errors. Update Purpose after archive.
## Requirements
### Requirement: API Client Reliability
The API Client SHALL handle HTTP errors and token refreshes predictably.

#### Scenario: Token Refresh Failure
- **WHEN** a token refresh attempt fails
- **THEN** the interceptor rejects the promise with a structured error object.
- **AND** the error handling logic compiles without "spread types may only be created from object types" errors.

