## 1. Implementation
- [x] 1.1 Update `frontend/src/components/layout/Header.tsx` to accept a `forceDark` prop (or similar mechanism) that forces the background to be black and text white, regardless of scroll state, if that's what's needed for the "Black Header" requirement. OR, simply use the existing `theme="dark"` and modify logic to allow `bg-black` always if requested.
    - *Refined Plan*: Add `variant?: 'transparent' | 'solid-black' | 'solid-white'` to Header. Default to current behavior (transparent -> scroll). New HomePage will use `variant="solid-black"`.
- [x] 1.2 Refactor `frontend/src/features/home/HomePage.tsx`:
    - Change main container `bg-black` to `bg-white`.
    - Update Hero section to use light gradients/backgrounds.
    - Update Text colors (White -> Black).
    - Update "Brand Showcase" and "Featured Products" sections to use light theme colors (gray-50/100 backgrounds).
    - Ensure "Why Choose Us" and "Stats" sections are legible on white.
- [x] 1.3 Verify the visual integrity (ensure no white text on white background).
