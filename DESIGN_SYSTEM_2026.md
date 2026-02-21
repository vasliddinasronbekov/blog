# 2026 Modern Design System - Blog App

## Overview
A cutting-edge design system inspired by **iOS 18+** and **visionOS**, featuring glassmorphism, spatial layering, and hyper-rounded UI elements for a premium 2026 aesthetic.

---

## 🎨 Design Philosophy

### Core Principles
1. **Glassmorphism**: High blur effects (20px) with semi-transparent backgrounds
2. **Spatial Depth**: Deep shadows for layering and visual hierarchy
3. **Hyper-Rounded**: Stadium-shaped buttons and tags (border-radius: 9999px)
4. **Bento Grid**: Flexible, responsive grid layout for content organization
5. **Semantic Transparency**: Both light and dark modes maintain transparency aesthetics

---

## 🎭 Color System

### Light Mode
```css
--bg-primary: #f8f9fa;      /* Main background */
--bg-secondary: #ffffff;     /* Card backgrounds */
--fg-primary: #0f1420;       /* Primary text */
--fg-secondary: #6b7280;     /* Secondary text */
--accent: #2563eb;           /* Primary accent */
--glass-light: rgba(255, 255, 255, 0.7);      /* Glass effect */
--glass-border-light: rgba(255, 255, 255, 0.5); /* Glass border */
```

### Dark Mode (visionOS-inspired)
```css
--bg-primary: #0b0e15;       /* Main background */
--bg-secondary: #1a1f2e;     /* Card backgrounds */
--fg-primary: #f0f3f8;       /* Primary text */
--fg-secondary: #a0a6b2;     /* Secondary text */
--accent: #60a5fa;           /* Primary accent */
--glass-light: rgba(26, 31, 46, 0.6);          /* Glass effect */
--glass-border-light: rgba(255, 255, 255, 0.08); /* Glass border */
```

---

## 🪟 Glassmorphism Components

### `.glass-card`
Semi-transparent card with backdrop blur for layered depth.

```css
.glass-card {
  background: var(--glass-light);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-light);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**Usage:**
- Post cards
- Navigation bar
- Content containers
- Modals and dialogs

---

## 🔘 Button System

### `.btn-primary`
Main call-to-action button with hyper-rounded style.

```css
.btn-primary {
  background: var(--accent);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;  /* Stadium shape */
  font-weight: 600;
  box-shadow: var(--shadow-xs);
}

.btn-primary:hover {
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### `.btn-secondary`
Secondary action with glass effect.

```css
.btn-secondary {
  background: var(--glass-light);
  color: var(--fg-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(10px);
}
```

---

## 🏷️ Tags

Hyper-rounded semantic tags with glassmorphic styling.

```css
.tag {
  display: inline-block;
  background: var(--glass-light);
  color: var(--fg-primary);
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(10px);
  font-size: 0.75rem;
  font-weight: 600;
}

.tag:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
```

---

## 🎲 Bento Grid Layout

Modern, asymmetric grid inspired by Apple's design language.

```css
.bento-grid {
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.bento-item-featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### Responsive Behavior
- **Mobile**: Single column (1x1 items)
- **Tablet**: 3-column grid with first item featured (2x2)
- **Desktop**: 4-column grid with dynamic sizing

---

## 🌓 Shadow System (Spatial Layering)

Five-level depth system for spatial hierarchy:

```css
--shadow-xs: 0 2px 8px rgba(0, 0, 0, 0.08);     /* Subtle */
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.12);    /* Light */
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);    /* Medium */
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.18);   /* Deep */
--shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.22);   /* Deepest */
```

**Usage Classes:** `.layer-1` through `.layer-5`

---

## 🌈 Theme Toggle

Semantic light/dark mode with system preference detection:

```typescript
// Data attribute approach
[data-theme='light'] { /* Light styles */ }
[data-theme='dark']  { /* Dark styles */ }
```

**Features:**
- Smooth 200ms transitions
- System preference detection
- Manual override support
- Persistent storage (localStorage)

---

## 📐 Spacing & Sizing

Consistent 4px base scale:

```css
/* Padding */
0.375rem (6px)
0.5rem   (8px)
0.75rem  (12px)
1rem     (16px)
1.5rem   (24px)
2rem     (32px)

/* Border Radius */
6px (subtle)
12px (standard)
16px (rounded)
20px (very rounded)
24px (glass cards)
9999px (hyper-rounded)
```

---

## 📱 Responsive Breakpoints

```css
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

---

## 🎬 Motion & Transitions

Smooth, performant animations:

```css
/* Hover effects */
transition: all 250ms cubic-bezier(0.23, 1, 0.320, 1);

/* Transform effects */
group-hover:scale-110        /* Image zoom */
group-hover:translateY(-4px) /* Lift effect */

/* Opacity transitions */
transition: opacity 300ms ease;
```

---

## ♿ Accessibility

- **Focus States**: 2px outline with 4px offset
- **Color Contrast**: WCAG AA compliant
- **Font Sizing**: Readable base 16px
- **Touch Targets**: Minimum 44x44px
- **Semantic HTML**: Proper heading hierarchy

---

## 🔄 Component Examples

### Post Card (Featured)
```tsx
<article className="bento-item-featured glass-card layer-2">
  {/* Image with gradient overlay */}
  {/* Content with glassmorphic tag */}
  {/* Metadata with author avatar */}
</article>
```

### Navigation Bar
```tsx
<nav className="glass-card m-4 md:m-6" style={{ borderRadius: '20px' }}>
  {/* Logo + Desktop Menu + Mobile Menu */}
  {/* Buttons: btn-primary, btn-secondary */}
</nav>
```

### Hero Section
```tsx
<section className="glass-card p-8 md:p-12 layer-3">
  {/* Gradient text heading */}
  {/* CTA button with hyper-rounded style */}
</section>
```

---

## 🎯 Design Tokens Summary

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--bg-primary` | #f8f9fa | #0b0e15 | Main background |
| `--fg-primary` | #0f1420 | #f0f3f8 | Primary text |
| `--accent` | #2563eb | #60a5fa | Accent color |
| `--glass-light` | rgba(255,255,255,0.7) | rgba(26,31,46,0.6) | Glass bg |
| `--shadow-md` | 0 8px 24px rgba(0,0,0,0.15) | 0 8px 24px rgba(0,0,0,0.6) | Medium depth |

---

## 🚀 Implementation Checklist

- [x] Color system with theme support
- [x] Glassmorphic components
- [x] Hyper-rounded buttons and tags
- [x] Bento grid layout
- [x] Shadow layering system
- [x] Smooth transitions
- [x] Dark/light mode toggle
- [x] Responsive design
- [x] Accessibility support

---

## 📚 References

- iOS 18+ Design System
- visionOS Spatial Design
- Glass Morphism Principles
- Bento Box Grid Layouts
- Backdrop Filter CSS

---

**Last Updated:** February 2026
**Version:** 1.0
