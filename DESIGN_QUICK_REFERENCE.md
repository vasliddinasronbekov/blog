# 🎨 Design System - Quick Reference

## Color Palette

### Light Mode
```
Background:    #f8f9fa (very light gray)
Surface:       #ffffff (pure white)
Text Primary:  #0f1420 (dark blue-black)
Text Secondary:#6b7280 (gray)
Accent:        #2563eb (vibrant blue)
Glass:         rgba(255, 255, 255, 0.7) - 70% opaque white
Border:        rgba(255, 255, 255, 0.5) - semi-transparent
```

### Dark Mode (visionOS-inspired)
```
Background:    #0b0e15 (very dark blue)
Surface:       #1a1f2e (dark blue)
Text Primary:  #f0f3f8 (off-white)
Text Secondary:#a0a6b2 (light gray)
Accent:        #60a5fa (cyan blue)
Glass:         rgba(26, 31, 46, 0.6) - 60% opaque
Border:        rgba(255, 255, 255, 0.08) - subtle
```

## Component Usage

### .glass-card
**Purpose:** Primary container for all content
```css
background: var(--glass-light);
backdrop-filter: blur(20px);
border: 1px solid var(--glass-border-light);
border-radius: 24px;
box-shadow: var(--shadow-sm);

/* On hover */
transform: translateY(-4px);
box-shadow: var(--shadow-md);
```

**Use Cases:**
- Post cards
- Hero sections
- Modals & dialogs
- Navigation bars
- Form containers

### .btn-primary
**Purpose:** Main call-to-action button
```css
background: var(--accent);
color: white;
padding: 0.75rem 1.5rem;
border-radius: 9999px;        /* Stadium shape */
font-weight: 600;
box-shadow: var(--shadow-xs);

/* On hover */
background: var(--accent-light);
transform: translateY(-2px);
box-shadow: var(--shadow-md);
```

**Use Cases:**
- Sign Up
- Create Post
- Submit Form
- Primary CTA

### .btn-secondary
**Purpose:** Secondary actions & toggles
```css
background: var(--glass-light);
color: var(--fg-primary);
padding: 0.75rem 1.5rem;
border-radius: 9999px;
border: 1px solid var(--glass-border-light);
backdrop-filter: blur(10px);
```

**Use Cases:**
- Sign In
- Cancel
- Secondary navigation
- Theme toggle

### .tag
**Purpose:** Category labels & badges
```css
display: inline-block;
background: var(--glass-light);
color: var(--fg-primary);
padding: 0.375rem 1rem;
border-radius: 9999px;
border: 1px solid var(--glass-border-light);
backdrop-filter: blur(10px);
font-size: 0.75rem;
font-weight: 600;

/* On hover */
background: var(--accent);
color: white;
border-color: var(--accent);
```

**Use Cases:**
- Post categories
- Status badges
- Topic labels

## Shadow System (Spatial Depth)

```css
--shadow-xs: 0 2px 8px rgba(0, 0, 0, 0.08);     /* Subtle */
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.12);    /* Light */
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);    /* Medium */
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.18);   /* Deep */
--shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.22);   /* Deepest */
```

### Layer Classes
```css
.layer-1  /* Subtle - Contact/close interaction */
.layer-2  /* Light - Cards (default) */
.layer-3  /* Medium - Hero sections, dialogs */
.layer-4  /* Deep - Modal backgrounds */
.layer-5  /* Deepest - Full-screen overlays */
```

## Typography Scale

```css
/* Heading sizes */
h1: 2.5rem (40px) - Page titles
h2: 1.875rem (30px) - Section titles
h3: 1.5rem (24px) - Card titles
h4: 1.25rem (20px) - Subsections

/* Body text */
Base: 1rem (16px) - Default
Small: 0.875rem (14px) - Secondary
Tiny: 0.75rem (12px) - Captions

/* Font weight */
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
Black: 900
```

## Spacing Scale (4px base)

```css
0.5rem   (8px)
0.75rem  (12px)
1rem     (16px)
1.5rem   (24px)
2rem     (32px)
3rem     (48px)
4rem     (64px)
```

## Border Radius

```css
6px   - Subtle (default inputs)
12px  - Standard (elements)
16px  - Rounded (larger elements)
20px  - Very rounded (navbar)
24px  - Glass cards
9999px - Hyper-rounded (buttons, tags)
```

## Transitions

```css
/* Standard */
transition: all 200ms ease;
transition: all 250ms cubic-bezier(0.23, 1, 0.320, 1);

/* Hover effects */
transform: translateY(-2px);    /* Lift */
transform: scale(1.05);         /* Grow */
transform: scale(1.1);          /* Large grow (images) */
```

## Grid System

### Bento Grid
```css
/* Mobile */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
grid-auto-rows: minmax(200px, auto);
gap: 1.5rem;

/* Tablet */
grid-template-columns: repeat(3, 1fr);

/* Featured item */
.bento-item-featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

## Button Variants

### Primary Button
```html
<button class="btn-primary">🚀 Action</button>
```
- Background: Accent color
- Text: White
- Shape: Stadium (9999px)
- Hover: Lift + enhanced shadow

### Secondary Button
```html
<button class="btn-secondary">⚙️ Settings</button>
```
- Background: Glass effect
- Text: Primary color
- Shape: Stadium (9999px)
- Border: Subtle line

### Ghost Button (plain link style)
```html
<button style="background: transparent; color: var(--fg-primary);">
  Link Style
</button>
```

## Theme Toggle States

```
System  (🖥️)  - Follows OS preference
Light   (☀️)  - Always light mode
Dark    (🌙)  - Always dark mode
```

**Data attribute:** `[data-theme='light']` or `[data-theme='dark']`

## Responsive Breakpoints

```css
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px

/* Tailwind shortcuts */
sm:  @media (min-width: 640px)
md:  @media (min-width: 768px)
lg:  @media (min-width: 1024px)
xl:  @media (min-width: 1280px)
```

## Common Patterns

### Hero Section
```tsx
<section className="glass-card p-8 md:p-12 layer-3">
  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
    Heading
  </h1>
  <p className="text-muted mt-4">Description</p>
  <button className="btn-primary mt-8">Action</button>
</section>
```

### Card Grid
```tsx
<div className="bento-grid">
  {items.map((item, i) => (
    <div key={item.id} className={i === 0 ? 'bento-item-featured' : ''}>
      <article className="glass-card layer-2">
        {/* Content */}
      </article>
    </div>
  ))}
</div>
```

### Form Input
```tsx
<input
  className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text..."
  style={{
    background: 'var(--glass-light)',
    border: '1px solid var(--glass-border-light)'
  }}
/>
```

### Status Message
```tsx
<div className="glass-card p-4 layer-2 border-red-400/20" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
  <p style={{ color: 'var(--accent)' }} className="font-semibold">
    ⚠️ Error message
  </p>
</div>
```

## Animation Examples

### Smooth Page Load
```css
* {
  transition: background-color 200ms ease, color 200ms ease;
}
```

### Card Hover
```css
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

### Button Click
```css
button:active {
  transform: scale(0.95);
}
```

### Image Zoom
```css
img {
  transition: transform 500ms;
}

.group-hover\:scale-110:hover {
  transform: scale(1.1);
}
```

---

## Quick CSS Copy-Paste

### Minimal Page Setup
```css
@import "app/globals.css";

body {
  background: var(--bg-primary);
  color: var(--fg-primary);
  font-family: system-ui;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Dark Mode Toggle Script
```typescript
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
```

---

**Last Updated:** February 2026
