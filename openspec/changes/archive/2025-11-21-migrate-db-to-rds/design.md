# Design: Amazon RDS Migration Strategy

## Migration Strategy: Offline (Stop-the-world)

To ensure data consistency without complex replication setup, we will use an offline migration strategy.
1.  Stop the application (or put in maintenance mode).
2.  Dump local data.
3.  Restore to RDS.
4.  Reconfigure application.
5.  Restart application.

## Connection Details & Credentials

**Target RDS Instance:**
- **Host/Endpoint**: `database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com`
    - *CRITICAL NOTE*: The value provided is an **ARN**. Applications require the **DNS Endpoint** (e.g., `database-2.xxxxxxxx.us-east-1.rds.amazonaws.com`). You must locate this in the AWS Console under the "Connectivity & security" tab of the RDS instance.
- **Database Name**: `verita_db`
- **User**: `postgres`
- **Password**: `Aa0908700714`
- **Port**: `5432`

**Local Source:**
- **Database Name**: `nextecommerce`
- **Port**: `5436` (as seen in .env)
- **User**: `user`

## Detailed Workflow

### 1. Pre-Migration Checks
- **Connectivity**: Verify you can connect to RDS from your machine/server.
    ```bash
    psql -h <RDS_ENDPOINT> -U postgres -d verita_db -p 5432 -W
    ```
- **Schema Sync**: Ensure Prisma schema matches. Ideally, run `prisma migrate deploy` against RDS first to set up the schema structure, then import data (using `--data-only` if schema exists, or full dump if not). *Recommendation: Full dump/restore is often cleaner for full migration.*

### 2. Export Data (Local)
Since local `pg_dump` tools are missing, we will use Docker.
```bash
# Dump from running container
docker exec veritashop-ecommerce-webapp-postgres-1 pg_dump -U user -d nextecommerce -F c -b -v -f /tmp/backup.dump

# Copy dump to host
docker cp veritashop-ecommerce-webapp-postgres-1:/tmp/backup.dump ./backup.dump
```

### 3. Import Data (RDS)
Use a temporary ephemeral container to restore.
```bash
# Run pg_restore from a container
docker run --rm -v ${PWD}/backup.dump:/backup.dump postgres:13 pg_restore -h <RDS_ENDPOINT> -p 5432 -U postgres -d verita_db -v --clean --if-exists /backup.dump
```
*Note*: You might encounter permission errors if the local `user` doesn't exist on RDS. Use `--no-owner --no-acl` flags with `pg_dump` or `pg_restore` to map ownership to the RDS `postgres` user.

### 4. Optimization & Verification
- Run `VACUUM (ANALYZE, VERBOSE);` in the RDS instance to update statistics.
- Check row counts for key tables (`User`, `Product`, `Order`).

### 5. Cutover
- Update `backend/.env`:
    ```
    DATABASE_URL="postgresql://postgres:Aa0908700714@<RDS_ENDPOINT>:5432/verita_db?schema=public"
    ```
- Restart backend service.

## Rollback Plan
If the application fails to connect or critical errors occur:
1.  Revert `backend/.env` to the previous `localhost` value.
2.  Restart backend.
3.  Investigate RDS logs (Connectivity, Authentication, or Timeout issues).

## Best Practices for AWS RDS
- **Security Groups**: Ensure the Security Group attached to `database-2` allows Inbound traffic on port `5432` from your application's IP address (or 0.0.0.0/0 for testing, but restrict immediately after).
- **SSL/TLS**: RDS supports SSL. Consider appending `&sslmode=require` to the connection string for security, provided the root certs are available (Node/Prisma usually handles this well).
- **Parameter Groups**: Check `work_mem` and `maintenance_work_mem` if performance is sluggish during heavy queries.
- **Performance Insights**: Enable this in AWS Console to monitor load.

## CI/CD Integration
To ensure the migration does not break CI/CD:
- **Environment Variables**: CI pipelines must be updated with the new RDS credentials (or kept pointing to a test database if tests are isolated).
- **Connectivity**: CI runners must have network access to the RDS instance if integration tests run against it.
- **Testing**: Run the full test suite (`npm run test`) before and after the switch to verify compatibility.
