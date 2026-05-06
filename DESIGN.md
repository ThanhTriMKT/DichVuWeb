Role & Context: You are an elite UI/UX designer and frontend developer. Your task is to build a premium, production-ready landing page strictly following the "Playful Claymorphism" aesthetic. The final output must exude professionalism, perfect proportions, and meticulous attention to detail.

Design style: Playful Claymorphism
- Background: white (#FFFFFF)
- Palette: Coral #FF6B6B, Sky #4ECDC4, Sunny Yellow #FFE66D, Lavender #C8B8E8
- Shapes: inflated bubbly elements, border-radius 32-48px, thick colored borders (3px)
- Shadows: colored drop-shadows (not black) matching element color at 40% opacity
- Font: Fredoka One 400 (headings, very rounded) + Nunito 500 (body) — Google Fonts
- Hover: spring bounce (cubic-bezier 0.34, 1.56, 0.64, 1), scale(1.1) + rotate(2deg), 300ms
- Interactions: confetti or sparkle CSS particle effect on button click
- Energy: maximum joy, every element feels alive and friendly

Design quality rules (required — do not skip):

1. SPACING (8px grid — strict, no exceptions):
   - Priority: ALWAYS use 'padding' and 'gap' (Flexbox/Grid) for spacing. Avoid 'margin' as much as possible to prevent layout breaking or collapsing margins.
   - Section padding: 96px top/bottom desktop, 64px mobile — NEVER less.
   - Gap between sections: 96px minimum.
   - Card padding: 24-32px inside. Gap between cards: 24px. Cards must NEVER touch each other.
   - Child elements inside cards: gap ≥ 16px between every element, flex/grid gap ≥ 16px.
   - Container: max-width 1280px, horizontal padding 24px mobile / 48px desktop. Use padding on inner container, NEVER apply padding directly to <section> tags.
   - Alignment: Use absolute px for precise centering/positioning to prevent flex height drift. Add more space if elements look crowded on 375px screens.

2. TYPOGRAPHY & FONTS:
   - Language Support: MUST choose Google Fonts that fully support Vietnamese (e.g. Inter, Roboto, Plus Jakarta Sans, Be Vietnam Pro) to prevent broken diacritics.
   - Variables (define in :root):
     --fs-display: clamp(2.5rem, 6vw, 5rem) / weight 800
     --fs-h1: clamp(1.75rem, 4vw, 3rem) / weight 700
     --fs-h2: clamp(1.25rem, 2.5vw, 2rem) / weight 600
     --fs-h3: clamp(1rem, 2vw, 1.5rem) / weight 600
     --fs-body: 1rem / weight 400 / line-height 1.6
     --fs-small: 0.875rem / weight 400

3. SHADOWS (define in :root):
   --shadow-sm: 0 1px 3px rgba(0,0,0,0.08)
   --shadow-md: 0 4px 16px rgba(0,0,0,0.10)
   --shadow-lg: 0 8px 32px rgba(0,0,0,0.12)
   --shadow-xl: 0 16px 48px rgba(0,0,0,0.15)

4. DESIGN & LAYOUT:
   - Color Distribution: 60% background, 30% neutral surfaces, 10% accent. Never paint large areas in accent color.
   - Buttons: min-height 44px, padding 12px 24px, border-radius matches cards. One primary CTA style only.
   - Visual Hierarchy: Important info must be larger, bolder, AND higher contrast.
   - Images: Always use realistic placeholders (e.g. Unsplash/Picsum). No empty colored divs.

5. CODE QUALITY & ACCESSIBILITY:
   - All colors as CSS variables.
   - Include cursor:pointer on clickable elements and hover states on interactive elements.
   - Use @media (prefers-reduced-motion: reduce) on all animations.
   - Use inline SVG instead of emojis for icons.
   - Responsive: Mobile-first breakpoints (375px / 768px / 1024px / 1440px). No horizontal scroll.

6. CONSISTENCY & PROFESSIONALISM:
   - Design System: Strictly use the CSS variables defined in :root for colors, spacing, typography, and border-radius. DO NOT introduce random "magic numbers" or hardcode hex values outside of the palette.
   - Component Harmony: Ensure all interactive elements (buttons, inputs, cards) share identical border-radius, border weights, and hover transition styles. Do not mix sharp and rounded styles arbitrarily.
   - Code Cleanliness: Use semantic HTML5. Keep CSS well-organized. No inline styles.
   - Final Polish: The output must look like a premium, award-winning website, not a basic template.


7. RESPONSIVE LAYOUT & OVERFLOW:
   - Mobile First: NEVER force multi-column grids (like 12-columns) on mobile. ALWAYS stack items to 1 column on mobile screens. Use media queries to activate multi-column layouts on desktop.
   - Flexible Cards: Cards must NOT have fixed heights that clip content. Use min-height and allow vertical expansion.
   - Overflow Prevention: Use 'word-break: break-word' to prevent wide text or links from breaking out of cards. Ensure child elements do not force the parent to grow beyond the viewport width.

Output a single complete HTML file, production quality, visually stunning.