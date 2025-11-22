# Database Migration Guide

## Local PostgreSQL Setup (Docker)

### Quick Start

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Wait for healthy status:**
   ```bash
   docker-compose ps postgres
   ```

3. **Apply schema** (choose one method):

   **Method A: Using Prisma (recommended for Linux/Mac):**
   ```bash
   cd backend
   npx prisma db push --accept-data-loss
   ```

   **Method B: Using Docker exec (Windows workaround):**
   ```bash
   cd backend
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   Get-Content schema.sql | docker exec -i veritashop-ecommerce-webapp-postgres-1 psql -U dbuser -d nextecommerce
   Remove-Item schema.sql
   ```

4. **Verify tables:**
   ```bash
   docker exec veritashop-ecommerce-webapp-postgres-1 psql -U dbuser -d nextecommerce -c "\dt"
   ```

5. **Seed database** (optional):
   ```bash
   cd backend
   npm run prisma:seed
   ```

### Database Credentials

- **Host:** localhost (or 127.0.0.1)
- **Port:** 5432
- **Database:** nextecommerce
- **User:** dbuser
- **Password:** dbpass123

### Connection String

```
DATABASE_URL="postgresql://dbuser:dbpass123@localhost:5432/nextecommerce"
```

### Troubleshooting

#### Prisma connection issues on Windows

**Symptom:** `P1000: Authentication failed` error with Prisma CLI

**Cause:** Known issue with Prisma CLI on Windows + Docker Desktop networking

**Solution:** Use Method B (Docker exec) to apply schema directly

**Note:** This only affects Prisma CLI commands. Your Node.js application runtime will connect fine!

#### Port already in use

**Symptom:** Port 5432 is already bound

**Solution:**
```bash
# Stop existing PostgreSQL service
docker-compose down

# Or change port in docker-compose.yml if you have another PostgreSQL running
```

#### Container not starting

**Check logs:**
```bash
docker logs veritashop-ecommerce-webapp-postgres-1
```

#### Reset database

**Warning: This deletes all data!**

```bash
docker-compose down -v
docker-compose up -d postgres
# Then apply schema again (step 3 above)
```

### GUI Tools

You can connect using:
- **pgAdmin**
- **DBeaver**
- **TablePlus**
- **DataGrip**

Use the credentials listed above.

### CI/CD

GitHub Actions uses a PostgreSQL service container with different credentials:
- User: testuser
- Password: testpassword
- Database: veritashop_test

No manual setup needed for CI/CD - it's automated in the workflow.
