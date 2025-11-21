# Change: Fix Database Schema Mismatch for ProductVariant

## Why
The application is crashing with a 500 error when accessing product variants in the Admin UI. The error message `The column ProductVariant.colorCode does not exist in the current database` indicates that the PostgreSQL database schema is out of sync with the Prisma schema definition. The `ProductRepository` attempts to query this field, causing the query to fail. This likely happened because a schema change (adding `colorCode`) was defined in `schema.prisma` but the corresponding migration was not applied to the database.

## What Changes
- **Database**:
    - Generate and apply a new Prisma migration to add the missing `colorCode` column to the `ProductVariant` table.
    - Verify that the `ProductVariant` table structure matches `backend/prisma/schema.prisma`.

## Impact
- **Affected Specs**: `product-variant-management`.
- **Affected Code**: None directly (database state only), but enables `ProductRepository.ts` to function correctly.
