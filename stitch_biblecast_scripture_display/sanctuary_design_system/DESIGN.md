---
name: Sanctuary Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-projection:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  projection-margin: 10%
---

## Brand & Style
The design system is built on the principles of reverence, clarity, and focus. It serves a dual purpose: a high-utility, professional admin interface for service preparation and a distraction-free, elegant presentation layer for worship. 

The aesthetic is **Minimalist** with a touch of **Traditional Elegance**. It avoids unnecessary ornamentation to ensure the sacred text remains the primary focus. The emotional response is one of serenity and reliability—giving church tech teams confidence and the congregation a peaceful environment for reflection.

The admin interface utilizes structured layouts and a restrained professional palette, while the projection output prioritizes high-contrast legibility and classical proportions.

## Colors
The palette is divided into two functional sets:

1.  **Admin Core:** Deep Navy (#0F172A) and Slate (#64748B) provide a stable, professional environment. These colors communicate trust and precision.
2.  **Spiritual Accents:** Gold (#C5A059) is used sparingly for primary actions or to highlight "Special Verse" states. Soft Blue (#E0E7FF) serves as a gentle highlight for selections and secondary indications.
3.  **Projection Tones:** Absolute Black and White are reserved for projection backgrounds to ensure maximum readability in high-ambient light environments.

Use `high_contrast_dark` for light-themed presentations and `high_contrast_light` for dark-themed sanctuary environments to ensure AA+ accessibility standards.

## Typography
The typography system creates a clear distinction between "The Word" and "The Tool."

- **The Projection Layer:** Uses **Playfair Display**. Its high-contrast strokes and elegant serifs evoke a sense of tradition and importance. For projection, use `display-projection` for single verses and `headline-lg` for longer passages.
- **The Admin Layer:** Uses **Inter** for all UI elements. It is neutral and systematic, allowing the user to focus on task completion without visual fatigue.
- **The Metadata Layer:** **Work Sans** is used for labels, timestamps, and utility text. It is set in semi-bold with slight letter spacing to maintain clarity at small sizes.

## Layout & Spacing
The layout uses a **Fixed Grid** for the admin dashboard (12 columns) and a **Safe Area Margin** for projection.

- **Admin Dashboard:** Employs a 16px gutter and 24px outer margin. Components are grouped using the 8px base unit rhythm to ensure a clean, structured interface.
- **Projection Canvas:** Content must never touch the edges. A `projection-margin` of 10% is enforced on all sides to account for physical screen variances and architectural obstructions in sanctuaries.
- **Responsive Behavior:** On tablet, the sidebar collapses into a rail. On mobile, the preparation view shifts to a single-column "Draft" mode, prioritizing text entry over layout management.

## Elevation & Depth
This design system uses **Tonal Layers** rather than heavy shadows to maintain a minimalist feel.

- **Surface 0:** The primary background (Neutral Slate 50).
- **Surface 1:** Content cards and sidebars (White). These use a very soft, 2px stroke in Slate 200 rather than a shadow.
- **Active Elevation:** Only the "Go Live" or "Active Slide" components receive a soft ambient shadow (12px blur, 10% opacity Navy) to indicate their critical status.
- **Overlays:** Modals and dropdowns use a "Backdrop Blur" (8px) to subtly separate the action from the background grid without creating heavy visual clutter.

## Shapes
The shape language is **Soft** and restrained.

- **Base Components:** Buttons and input fields use a 0.25rem (4px) radius. This provides a modern look while remaining professional and structured.
- **Containers:** Presentation thumbnails and content cards use `rounded-lg` (0.5rem) to differentiate them from the more rigid UI controls.
- **Projection Elements:** Overlays and text boxes used during projection should remain sharp (0px) to maximize the "architectural" and "classic" feel of the serif typography.

## Components
- **Buttons:** Primary buttons are Solid Navy with White text. "Go Live" actions use the Gold accent with Navy text for high visibility. Secondary buttons use a ghost style (Slate outline).
- **Chips:** Used for Scripture tags (e.g., "Gospels," "Psalms"). These should have a background of Soft Blue with a Slate 800 label.
- **Lists:** Scripture search results use high-density lists with subtle dividers. The "Active Slide" in a list is marked by a 4px Gold left-border.
- **Input Fields:** Search bars and verse editors are clean with a 1px Slate border that turns Navy on focus. Labels are always visible above the field in `label-sm`.
- **Projection Cards:** Large-scale cards used in the preparation view. They should mirror the aspect ratio of the output (16:9) and show an accurate preview of the Playfair Display typography.
- **Verse Selector:** A specialized grid component for selecting chapter/verse numbers, utilizing a 1:1 square aspect ratio for buttons to create a clean, tactile grid.