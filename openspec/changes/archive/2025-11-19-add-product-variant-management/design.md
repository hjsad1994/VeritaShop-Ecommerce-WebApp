## Context
- Prisma already defines `ProductVariant`, `ProductImage`, and `Inventory` relations, but HTTP endpoints only expose product-level CRUD. Merchants need to manage per-SKU data (color, storage, RAM, price) and attach gallery images.
- Admin UI currently lists products but has no variants table. Manual DB edits risk SKU collisions, stale pricing, and unsynced inventory levels.
- Requirements: CRUD endpoints secured by `ADMIN|MANAGER`, validation symmetry between backend and Next.js form, and UI integrated into `/admin`.

## Goals / Non-Goals
- Goals: deliver full variant CRUD, keep inventory synchronized, expose professional admin UX with previews and validation feedback, ensure SKUs remain unique.
- Non-goals: revamp public product detail pages, rework checkout logic, or add multi-currency pricing. These may consume variant data but are outside this change.

## Decisions
1. **API Layout**: Implement nested REST endpoints (`/api/admin/products/:productId/variants`) to align with existing resource hierarchy. Chosen over standalone `/variants` to scope variant lifecycle to a product and leverage existing product middleware.
2. **Validation Strategy**: Mirror backend validator schema (color length, price > 0, SKU uppercase) on the frontend via Zod to guarantee identical error copy. Avoid duplicating regex constants by exporting shared values from a `variantRules.ts`.
3. **Inventory Sync**: The service automatically ensures every variant has an `Inventory` row. On creation we insert inventory with default stock thresholds; on delete we soft-delete variant plus inventory (or enforce cascade). This avoids orphaned stock records.
4. **UI Pattern**: Use shadcn-like table + drawer pattern inside `/admin/products/[id]/variants` for quick edits. Drawers keep users within context rather than navigating to subpages. Uploads reuse existing presigned S3 flow.
5. **Image Scoped Storage**: Variant-specific images keep `variantId` so gallery tabs can switch between product-level and variant-level imagery without duplicating records.

## Risks / Trade-offs
- **Complexity**: Coupling inventory updates to variant service adds transactional complexity; resolved by wrapping Prisma writes in `prisma.$transaction`.
- **Performance**: Listing products with variants might return large payloads. Mitigate by paginating variant list or fetching on demand when admin navigates to variant tab.
- **Validation Drift**: Having shared constants reduces drift, but forgetting to update frontend copy remains a risk. Include tests that assert validation messages.
- **Image Upload Latency**: Variant drawers performing S3 uploads could feel slow; use optimistic UI + toasts and restrict file sizes per existing S3 config.

## Migration Plan
1. Create/adjust Prisma constraints (if needed) and run `prisma migrate dev`.
2. Deploy backend API with additive routes (no breaking change to existing endpoints).
3. Roll out frontend admin screens behind role gate; verify using seeded variants.
4. Communicate new workflow to merch team; update docs.

## Open Questions
- Do variants require soft delete or hard delete? (Default to soft toggle via `isActive` + optional hard delete when inventory quantity is zero.)
- Should inventory quantity be editable from the variant drawer or remain in the inventory module?
- Are there upcoming attributes (e.g., band support) that should be modeled now?

