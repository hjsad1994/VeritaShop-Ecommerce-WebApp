# Database Migration: Cloud to Local PostgreSQL

## Overview
This OpenSpec change proposal provides a comprehensive plan for migrating the VeritaShop database from AWS RDS PostgreSQL to a local Docker-based PostgreSQL instance.

## Change ID
`migrate-db-to-local-postgresql`

## Status
✅ **Proposal Complete** - Ready for review and approval

## Validation
```bash
npx openspec validate migrate-db-to-local-postgresql --strict
```
✅ All validation checks passed

## Files in This Change

### Core Documents
1. **proposal.md** - High-level overview, motivation, and impact analysis
2. **design.md** - Technical architecture, decisions, risks, and migration plan
3. **tasks.md** - Detailed implementation checklist with 12 phases and ~60 tasks

### Spec Deltas
- **specs/backend-db/spec.md** - Complete specification changes for database connectivity

## Key Changes Summary

### What's Being Modified
- **Cloud to Local**: Replace AWS RDS with Docker PostgreSQL
- **Port Standardization**: Change from 5436 to standard 5432
- **Environment Variables**: Update DATABASE_URL format
- **CI/CD**: Use service containers instead of external DB
- **New Dockerfile**: Containerize backend application

### Breaking Changes
⚠️ **DATABASE_URL format changes** - Team must update local `.env` files
⚠️ **Docker required** - All developers need Docker installed
⚠️ **AWS RDS credentials removed** - Cloud database access discontinued

### Benefits
✨ Zero network latency (50-200ms → <5ms)
✨ Offline development capability
✨ No cloud costs for dev database
✨ Consistent team environment
✨ Faster CI/CD pipelines

## Review Checklist

### Before Approval
- [ ] Review proposal.md for business justification
- [ ] Review design.md for technical soundness
- [ ] Verify all requirements have scenarios (validated ✅)
- [ ] Check tasks.md for implementation completeness
- [ ] Confirm breaking changes are acceptable
- [ ] Validate CI/CD impact is understood

### Implementation Prerequisites
- [ ] Docker installed on all development machines
- [ ] Team notified of upcoming migration
- [ ] Backup strategy for existing RDS data (if needed)
- [ ] Rollback plan reviewed and understood

## Quick Start Commands

### View Full Proposal
```bash
npx openspec show migrate-db-to-local-postgresql
```

### View Spec Deltas Only
```bash
npx openspec show migrate-db-to-local-postgresql --json --deltas-only
```

### Validate Proposal
```bash
npx openspec validate migrate-db-to-local-postgresql --strict
```

## Implementation Timeline

| Phase | Estimated Time |
|-------|---------------|
| Pre-Migration Preparation | 1 hour |
| Docker & Backend Setup | 3 hours |
| Environment & Database Init | 2 hours |
| CI/CD Updates | 2 hours |
| Testing & Validation | 3 hours |
| Documentation | 2 hours |
| Security & Cleanup | 1 hour |
| Deployment & Communication | 2 hours |
| **Total** | **~16 hours (2 days)** |

## Affected Specifications

### backend-db (Complete Overhaul)
- ✅ **Modified**: Local Database Connectivity
- ✅ **Modified**: Docker Compose Integration
- ✅ **Modified**: Secure Configuration
- ❌ **Removed**: Cloud Database Connectivity
- ✅ **Added**: Containerized Backend Service
- ✅ **Added**: CI/CD PostgreSQL Service
- ✅ **Added**: Development Environment Consistency

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Compose Environment          │
│                                             │
│  ┌──────────────┐       ┌───────────────┐  │
│  │   Backend    │       │  PostgreSQL   │  │
│  │  (Node.js)   │──────▶│      13       │  │
│  │  Port: 5000  │       │  Port: 5432   │  │
│  └──────────────┘       └───────────────┘  │
│         │                      │            │
└─────────┼──────────────────────┼────────────┘
          │                      │
          ▼                      ▼
    ┌──────────┐          ┌──────────┐
    │ Frontend │          │  Volume  │
    │(Next.js) │          │postgres- │
    │ Port:3000│          │   data   │
    └──────────┘          └──────────┘
```

## Database Connection Changes

### Before (Cloud RDS)
```env
DATABASE_URL="postgresql://postgres:Aa0908700714@database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com:5432/verita_db?schema=public"
```

### After (Local Docker)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nextecommerce?schema=public"
```

## CI/CD Impact

### Backend CI Workflow
✅ Already configured with PostgreSQL service container
✅ Just needs environment variable update
✅ No external dependencies

### Frontend CI Workflow
✅ No direct changes needed
✅ Continues to mock/stub API calls

## Next Steps

1. **Team Review**: Share this proposal with team leads and stakeholders
2. **Approval Gate**: Get explicit approval before implementation
3. **Schedule**: Pick a low-traffic time window for migration
4. **Communication**: Notify all developers 24-48 hours in advance
5. **Implementation**: Follow tasks.md sequentially
6. **Validation**: Run full test suite and CI/CD verification
7. **Deployment**: Merge to main after all checks pass
8. **Support**: Monitor team migration and provide assistance

## Rollback Strategy

If critical issues arise:
1. Revert `.env` to AWS RDS connection string
2. Revert `docker-compose.yml` changes
3. Revert CI/CD workflow changes
4. Estimated rollback time: **~15 minutes**

## Questions or Concerns?

- Review the detailed design.md for technical decisions
- Check tasks.md for step-by-step implementation
- Verify proposal.md addresses business requirements
- Run validation: `npx openspec validate migrate-db-to-local-postgresql --strict`

## Success Criteria

✅ Local PostgreSQL runs in Docker on port 5432
✅ Backend connects to local database successfully
✅ All Prisma migrations apply without errors
✅ CI/CD pipeline passes with containerized PostgreSQL
✅ No AWS RDS credentials in codebase
✅ All team members migrated successfully
✅ Developer experience improved
✅ Documentation complete and accurate

---

**Change Author**: AI Assistant (Droid)
**Created**: 2025-11-22
**Status**: Awaiting Approval ⏳
