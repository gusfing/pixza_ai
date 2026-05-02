# Pixza Studio — Design System

> Version 1.0 · May 2026

---

## Color Palette

### Base
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0d1117` | All page backgrounds |
| `--surface` | `#161b22` | Cards, panels, modals |
| `--surface-high` | `#21262d` | Elevated surfaces, hover states |
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border-md` | `rgba(255,255,255,0.12)` | Hover/focus borders |

### Text
| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#e6edf3` | Headings, primary content |
| `--text-secondary` | `rgba(255,255,255,0.60)` | Body text, descriptions |
| `--text-muted` | `rgba(255,255,255,0.30)` | Labels, metadata |
| `--text-dim` | `rgba(255,255,255,0.15)` | Placeholders, disabled |

### Accent
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#7c6af7` | Primary interactive, focus rings |
| `--accent-dim` | `rgba(124,106,247,0.12)` | Accent backgrounds |

### Plan Tiers
| Plan | Text | Background | Border |
|---|---|---|---|
| Free | `text-white/40` | `bg-white/5` | `border-white/10` |
| Pro | `text-violet-400` | `bg-violet-500/10` | `border-violet-500/20` |
| Agency | `text-amber-400` | `bg-amber-500/10` | `border-amber-500/20` |

### Semantic
| Token | Value | Usage |
|---|---|---|
| Success | `#22c55e` | Confirmations, paid status |
| Warning | `#f59e0b` | Low credits, caution |
| Error | `#ef4444` | Errors, destructive actions |
| Info | `#3b82f6` | Informational states |

---

## Typography

### Font Stack
- **Display / Headings**: `Outfit` (variable, loaded via next/font)
- **Body / UI**: `Inter` (variable, loaded via next/font)
- **Mono**: `system-ui` monospace fallback

### Scale
| Name | Size | Weight | Usage |
|---|---|---|---|
| `display-xl` | `clamp(48px, 6vw, 80px)` | 900 | Hero headlines |
| `display-lg` | `clamp(36px, 4vw, 56px)` | 900 | Section headlines |
| `display-md` | `clamp(28px, 3vw, 40px)` | 800 | Page titles |
| `heading` | `20–24px` | 700 | Card titles, section headers |
| `body-lg` | `16–18px` | 400 | Primary body text |
| `body` | `14px` | 400 | Default body |
| `body-sm` | `13px` | 400 | Secondary body |
| `label` | `11–12px` | 600 | Labels, badges |
| `caption` | `10px` | 700 | Uppercase tracking labels |

### Tracking
- Headlines: `tracking-tighter` (`-0.03em`)
- Labels: `tracking-widest` (`0.15em`) + `uppercase`
- Body: default

---

## Spacing

### Base Unit: 4px
| Token | Value | Usage |
|---|---|---|
| `xs` | `4px` | Tight gaps |
| `sm` | `8px` | Component internal |
| `md` | `16px` | Default gap |
| `lg` | `24px` | Section padding |
| `xl` | `32px` | Large gaps |
| `2xl` | `48px` | Section spacing |
| `3xl` | `64px` | Page sections |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | `8px` | Buttons, inputs, small elements |
| `md` | `12px` | Cards, dropdowns |
| `lg` | `16px` | Panels, modals |
| `xl` | `20px` | Large cards |
| `2xl` | `24px` | Feature cards |
| `full` | `9999px` | Pills, avatars |

---

## Components

### Buttons

```
Primary:   bg-white text-black hover:bg-white/90 rounded-xl px-5 py-2.5 font-black text-sm
Secondary: border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl px-5 py-2.5 font-bold text-sm
Danger:    border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 font-bold text-xs
Ghost:     text-white/40 hover:text-white transition-colors
```

### Inputs
```
bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white
placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all
```

### Cards
```
bg-white/5 border border-white/8 rounded-2xl p-5
```

### Badges / Pills
```
text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border
```

### Tabs (active)
```
bg-white text-black rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest
```

### Tabs (inactive)
```
text-white/30 hover:text-white rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest
```

---

## Layout

### Page Structure
```
min-h-screen bg-[#0d1117] text-white font-sans antialiased
```

### Max Widths
| Context | Max Width |
|---|---|
| Landing sections | `max-w-7xl` |
| App content | `max-w-2xl` (create), `max-w-5xl` (settings) |
| Blog/docs | `max-w-3xl` |
| Auth forms | `max-w-md` |

### Header Height
- Landing: `h-12` (sticky, transparent → dark on scroll)
- App (create/studio): `h-11` (always dark)
- Settings/gallery: `h-14`

### Sidebar Width
- Create page: `w-20` (icon-only)
- Settings: `w-52` (text labels)

---

## Animations

### Transitions
- Default: `transition-all duration-200`
- Slow: `transition-all duration-500`
- Spring: `ease: [0.19, 1, 0.22, 1]` (Framer Motion)

### Page Transitions
- Enter: `opacity-0 y-8` → `opacity-100 y-0` (200ms)
- Exit: `opacity-100 y-0` → `opacity-0 y-(-8)` (200ms)

### Hover Effects
- Cards: `translateY(-2px)` + border brightening
- Buttons: `scale(1.02)` on primary
- Images: `scale(1.05)` on hover

---

## Icons

**Library**: Lucide React  
**Default size**: `w-4 h-4` (16px)  
**Large**: `w-5 h-5` (20px)  
**Small**: `w-3.5 h-3.5` (14px)  
**Color**: Inherit from parent text color

---

## Page-Specific Guidelines

### Landing Page
- Hero: Full-viewport with scroll animation
- Sections: `py-24 px-6` with `max-w-7xl mx-auto`
- Feature cards: `h-[480px]` with image overlay + gradient mask
- Pricing: White card for popular plan, dark for others

### Create Page
- Sidebar: `w-20` icon-only, `bg-[#0d1117]`, `border-r border-white/5`
- Content: `max-w-2xl mx-auto px-5 pt-8 pb-16`
- Greeting: Hidden once results appear
- Results: Full-width image, no letterboxing

### Settings Page
- Layout: Sidebar nav + main content, `max-w-5xl mx-auto px-6 py-10`
- Tabs: Vertical on desktop, horizontal scroll on mobile
- Cards: `bg-white/5 border border-white/8 rounded-2xl p-5`

### Auth Pages
- Layout: Centered, `max-w-md`, dark background
- Form: Single column (no 2-column grid)
- CTA: Standard button, not circular

### Gallery Page
- Grid: CSS Grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`
- Cards: Fixed aspect ratio with hover overlay
- Lightbox: `fixed inset-0 bg-black/90`

### Blog Page
- Use Tailwind classes, not inline styles
- Background: `bg-[#0d1117]` (unified)
- Cards: Standard card component

### Onboarding Page
- Use Tailwind classes, not inline styles
- Background: `bg-[#0d1117]` (unified)
- Progress: `h-0.5 bg-white/5` with `bg-violet-500` fill

---

## Do's and Don'ts

### ✅ Do
- Use `#0d1117` as the universal page background
- Use Tailwind classes (not inline styles)
- Use `font-black` for headings, `font-bold` for UI, `font-medium` for body
- Use `tracking-tighter` on large headings
- Use `uppercase tracking-widest font-black text-[10px]` for section labels
- Keep borders subtle: `border-white/8` default
- Use `rounded-2xl` for cards, `rounded-xl` for buttons/inputs

### ❌ Don't
- Use `#040406` or `#0A0A0A` as page background (use `#0d1117`)
- Use inline `style={{}}` for colors/spacing (use Tailwind)
- Use `#92dce5` cyan accent (replaced by `#7c6af7` violet)
- Use circular/unusual button shapes
- Use 2-column form layouts on mobile
- Mix `glass-panel` CSS class with Tailwind (pick one)

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text
- Focus rings: `focus:ring-2 focus:ring-violet-500/50`
- Interactive elements: minimum `44px` touch target
- Images: Always include `alt` text
- Form labels: Always visible (not just placeholder)
