## Context
- `/admin/inventory` now mixes summary cards, catalog picker cards, and a dense table in one scroll column. Once the catalog exceeds ~15 products, the picker and table become misaligned and admins lose track of which `ProductVariant` they are editing.
- UI filters (brand, include archived) exist on the frontend but the backend `GET /api/inventory` ignores those params, so users see no change and assume the feature is broken.
- Manual stock actions technically work, yet each modal requires re-selecting the variant ID; as the catalog grows this invites mistakes and duplicate adjustments.

## Goals / Non-Goals
- Goals:
  - Keep the latest summary stats visible while offering large-catalog navigation that scales past 100 variants.
  - Guarantee every manual movement targets the selected variant without retyping IDs.
  - Provide backend query capabilities (brand, archived, status, sort) that match the redesigned filters.
  - Surface a lightweight context panel showing thresholds and recent movements so admins can confirm state before mutating stock.
- Non-Goals:
  - Introducing demand forecasting or automatic replenishment logic.
  - Replacing the existing stock movement history API (we will reuse it inside the new panel/drawer).
  - Changing customer-facing availability endpoints; scope is admin-only.

## Decisions
- Decision: Adopt a three-panel layout (summary header, 320px catalog column, main table + detail panel) with sticky filter toolbar. This keeps selection + stats in view and avoids stacking everything in one column.
- Decision: Centralize variant selection in a single piece of state shared by the catalog list, table rows, and manual action modals. Actions will read the selected variant unless the modal explicitly overrides it.
- Decision: Extend the existing `GET /api/inventory` endpoint instead of adding a new route so pagination, permissions, and DTOs remain consolidated. New query params (`brandId`, `includeArchived`, `status`, `sort`) and richer payload fields feed the UI.
- Decision: Reuse `GET /api/inventory/movements/:variantId` inside the context panel but cache the latest movement timestamp in the list payload to avoid extra round-trips unless the panel is open.

## Risks / Trade-offs
- More complex layout state may regress mobile experiences; mitigation: add collapsible catalog + panel toggles and test at tablet widths.
- Extending the list query adds optional joins (brand, movement aggregates) which could slow responses; mitigation: use Prisma select projections and only compute aggregates (e.g., `lastMovementAt`) via subqueries.
- Virtualizing or infinite-scrolling the inventory table increases implementation cost; mitigation: start with paginated chunks and only add virtualization once pagination is confirmed.

## Migration Plan
1. Ship backend changes first so existing UI can start honoring filters without breaking current behavior.
2. Update the frontend API client and shared types to consume the enriched payload.
3. Incrementally roll out the new layout behind a feature flag or route-level toggle if needed; otherwise, replace the existing page once parity is achieved.
4. Perform manual QA on seeded data covering >30 variants to validate scroll + selection patterns.

## Open Questions
- Do we need saved filter presets (e.g., “Only archived Samsung variants”) or is manual filtering enough for this release?
- Should the variant context panel show movement history inline (last 5 entries) or keep the existing drawer and simply show a summary? For now we plan to surface the latest entry and a link to the drawer.

