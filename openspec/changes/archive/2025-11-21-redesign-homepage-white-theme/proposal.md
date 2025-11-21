# Change: Redesign Homepage with White Theme

## Why
The user requested a redesign of the homepage to use a "White" theme instead of the current dark/black theme. They also specifically requested that the Header be "black" (or have a distinct contrasting color). This visual refresh aims to provide a cleaner, lighter aesthetic while maintaining navigational clarity.

## What Changes
-   **Header Update**: Modify `Header` to support a forced "dark" mode (solid black background) even when the rest of the theme is light, or use `theme="light"` with specific adjustments if needed. (Plan: Use `theme="light"` for content, but if user wants "Header Black", we might need a `variant="dark-filled"` or similar. *Decision*: We will update `HomePage` to pass `theme="light"` but we will also modify `HomePage` to use a black background for the header area or ensure contrast. Actually, standard "White Theme" usually has a white header with black text. If the user wants "Header Black", they likely mean the *background* of the header. I will add a prop `forceDarkBg` to `Header` or just style it in `HomePage` context. *Simpler*: Use `theme="dark"` (white text) and ensure `bg-black` is always active, not just on scroll. But the rest of the page is white. This creates a high-contrast bar.)
-   **HomePage Redesign**:
    -   Change global background to `bg-white`.
    -   Update all text colors from white/gray-400 to black/gray-600.
    -   Invert section backgrounds (e.g., "Brand Showcase", "Featured Products") from black/zinc to white/gray-50.
    -   Update product cards and styling to work on light backgrounds (shadows instead of borders/glows).

## Impact
-   **Affected Specs**: `shop-experience`
-   **Affected Code**:
    -   `frontend/src/features/home/HomePage.tsx`
    -   `frontend/src/components/layout/Header.tsx` (potentially, to support forced background)
