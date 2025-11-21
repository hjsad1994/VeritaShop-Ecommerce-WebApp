# Change: Enhance Homepage Visuals

## Why
The user has requested a "nicer" redesign ("THIET KE LAI DEP HON 1 XIU"), specifically building upon the previous white theme. The current implementation is functional but can be visually enhanced with:
- Better typography (more elegant headings, refined weights)
- Smoother gradients and transitions
- Enhanced spacing and layout (more breathing room)
- Subtle animations (hover effects, entrance animations)
- Refined card designs (cleaner shadows, border radii)

## What Changes
- **Typography**: Use a more modern font stack or refine existing weights/sizes for better hierarchy.
- **Hero Section**: Improve the gradient background to be softer and more premium. Add entrance animations for text and image.
- **Product Cards**: Refine the card design with softer shadows (`shadow-lg` -> `shadow-xl` on hover), smoother transitions, and better spacing.
- **Section Backgrounds**: Alternate between pure white (`bg-white`) and very subtle gray (`bg-slate-50` or `bg-gray-50`) to create depth without harsh contrast.
- **Spacing**: Increase padding in sections to `py-32` or similar for a more open feel.

## Impact
- **Affected Specs**: `shop-experience`
- **Affected Code**: `frontend/src/features/home/HomePage.tsx`
