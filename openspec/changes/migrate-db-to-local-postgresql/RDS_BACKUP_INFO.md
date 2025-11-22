# AWS RDS Connection Details (Backup Reference)

**Created**: 2025-11-22
**Purpose**: Rollback reference for emergency recovery

## Original RDS Configuration

### Connection Details
- **Host**: `database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com`
- **Port**: `5432`
- **Database**: `verita_db`
- **Username**: `postgres`
- **Password**: `[REDACTED - see original .env backup]`
- **Region**: `ap-southeast-1` (Singapore)

### Original DATABASE_URL Format
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com:5432/verita_db?schema=public"
```

**Note**: AWS S3/CloudFront credentials remain active and unchanged in .env. Only database connection is being migrated.

## Rollback Procedure

If migration fails and rollback is needed:

1. Revert `backend/.env` to use the original RDS DATABASE_URL (see format above with actual password)
2. Revert `docker-compose.yml` port mapping
3. Restart backend service
4. Verify connection to RDS

## Data Backup (Optional)

To backup RDS data before migration (requires RDS password):
```bash
pg_dump -h database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com \
        -U postgres \
        -d verita_db \
        -F c \
        -f backup_$(date +%Y%m%d_%H%M%S).dump
```

**WARNING**: This file contains sensitive credentials. DO NOT commit to repository.
