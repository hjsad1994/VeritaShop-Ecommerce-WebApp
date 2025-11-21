# Tasks: RDS Migration

## Phase 1: Preparation
- [x] **Get RDS Endpoint**: Log in to AWS Console, go to RDS > Databases > database-2, copy the "Endpoint" URL. <!-- id: get-endpoint -->
- [x] **Verify Connectivity**: Attempt a manual connection to RDS using `psql` or a GUI tool (DBeaver/PgAdmin). <!-- id: verify-conn -->
- [x] **Stop Application**: Stop the running backend server to prevent new data writes. <!-- id: stop-app -->

## Phase 2: Data Migration
- [x] **Dump Local DB**: Run `pg_dump` via Docker. <!-- id: dump-db -->
    - Command: `docker exec veritashop-ecommerce-webapp-postgres-1 pg_dump -U user -d nextecommerce -F c -b -v -f /tmp/backup.dump && docker cp veritashop-ecommerce-webapp-postgres-1:/tmp/backup.dump ./backup.dump`
- [x] **Restore to RDS**: Run `pg_restore` via Docker. <!-- id: restore-db -->
    - Command: `docker run --rm -v ${PWD}/backup.dump:/backup.dump postgres:13 pg_restore -h database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com -p 5432 -U postgres -d verita_db -v --clean --if-exists --no-owner --no-acl /backup.dump`

## Phase 3: Configuration & Verification
- [x] **Update Env**: Modify `backend/.env` `DATABASE_URL` with RDS credentials and endpoint. <!-- id: update-env -->
- [x] **Prisma Verify**: Run `npx prisma db pull` or `npx prisma studio` to verify Prisma can read the schema/data from RDS. <!-- id: prisma-verify -->
- [x] **Start Application**: Restart the backend server. <!-- id: start-app -->
- [x] **Smoke Test**: Verify login, product listing, and cart functionality in the app. <!-- id: smoke-test -->
- [x] **Run CI/CD**: Execute full test suite locally or trigger a pipeline run to ensure no regressions. <!-- id: run-ci -->

## Phase 4: Post-Migration
- [x] **Optimize**: Run `VACUUM ANALYZE` on RDS. <!-- id: db-optimize -->
- [x] **Security Check**: Review AWS Security Group rules to restrict access as much as possible. <!-- id: sec-check -->
