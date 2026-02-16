# Medical Software UI/UX Design System Contract

**Project:** Healthcare Application Styling Specification
**Version:** 1.0
**Date:** February 16, 2026
**Prepared For:** If True Then LLC

---

## 1. Purpose & Scope

This document serves as the binding design contract for the front-end styling of the medical/healthcare software application. All UI components, pages, and modules developed under this project shall strictly adhere to the specifications outlined below. Deviations require written approval and a formal amendment to this contract.

The overall visual direction shall be **modern, clean, and professional** — comparable in quality and feel to contemporary SaaS products such as Linear, Vercel Dashboard, or Notion. The application must never appear dated or resemble legacy 1990s/2000s-era software.

---

## 2. Color System

### 2.1 Background Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--bg-page` | `#F0F4F8` | Primary page background (soft blue-gray) |
| `--bg-card` | `#FFFFFF` | Card and panel surfaces |
| `--bg-sidebar` | `#1B2A4A` | Sidebar and primary navigation |
| `--bg-sidebar-gradient` | `linear-gradient(180deg, #1B2A4A, #162240)` | Sidebar gradient for modern depth |
| `--bg-overlay` | `rgba(0, 0, 0, 0.5)` | Modal and dialog overlays |
| `--bg-table-alt` | `#F7FAFC` | Alternating table row background |
| `--bg-hover` | `#EBF2FA` | Hover state for rows, cards, list items |
| `--bg-table-header` | `#F0F4F8` | Table header row background |

### 2.2 Primary Brand Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-primary` | `#0B6FA4` | Primary actions, links, brand identity |
| `--color-primary-hover` | `#085A85` | Hover state for primary elements |
| `--color-primary-light` | `#E1F0FA` | Badges, tags, light fills, subtle highlights |
| `--color-primary-gradient` | `linear-gradient(135deg, #0B6FA4, #0E87C7)` | Primary button gradient for depth |
| `--color-secondary` | `#00897B` | Secondary actions, teal accent |
| `--color-secondary-hover` | `#00796B` | Hover state for secondary elements |

### 2.3 Status / Semantic Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--color-success` | `#2E7D32` | Normal vitals, positive indicators, confirmations |
| `--color-warning` | `#EF8C00` | Caution states, borderline values |
| `--color-critical` | `#C62828` | Alerts, critical values, errors, danger actions |
| `--color-critical-hover` | `#B71C1C` | Hover state for danger/critical buttons |
| `--color-info` | `#0277BD` | Informational notices |
| `--color-disabled` | `#B0BEC5` | Disabled and inactive elements |

### 2.4 Neutral / Text Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--text-heading` | `#1B2A4A` | Page titles, section headers (dark navy) |
| `--text-subheading` | `#2D3748` | Card titles, sub-headers |
| `--text-body` | `#334155` | Body text, table cells |
| `--text-secondary` | `#64748B` | Helper text, labels, captions, table headers |
| `--text-placeholder` | `#94A3B8` | Input placeholder text |
| `--text-disabled` | `#94A3B8` | Disabled button text |
| `--border-default` | `#E2E8F0` | Card borders, table dividers, separators |
| `--border-input` | `#CBD5E1` | Input and form field borders |

> **Rule:** Pure black (`#000000`) shall never be used for text anywhere in the application. All dark text uses `#1B2A4A` or `#334155`.

---

## 3. Typography

### 3.1 Font Family

```
font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
```

Inter shall be imported from Google Fonts. If unavailable, the system falls back gracefully through the stack.

### 3.2 Type Scale

| Element | Size | Weight | Color | Line Height | Additional |
|---------|------|--------|-------|-------------|------------|
| Page Title (h1) | 24px | 700 (Bold) | `#1B2A4A` | 1.3 | — |
| Section Header (h2) | 20px | 600 (Semi-Bold) | `#1B2A4A` | 1.3 | — |
| Card Title (h3) | 16px | 600 (Semi-Bold) | `#2D3748` | 1.3 | — |
| Body Text | 14px | 400 (Regular) | `#334155` | 1.5 | — |
| Secondary / Helper | 13px | 400 (Regular) | `#64748B` | 1.5 | — |
| Labels & Captions | 12px | 500 (Medium) | `#64748B` | 1.4 | `text-transform: uppercase; letter-spacing: 0.5px` |
| Table Cell | 14px | 400 (Regular) | `#334155` | 1.5 | — |
| Table Header | 12px | 600 (Semi-Bold) | `#64748B` | 1.4 | `text-transform: uppercase` |

### 3.3 Link Styling

| Property | Value |
|----------|-------|
| Color | `#0B6FA4` |
| Text Decoration | None (default) |
| Hover Decoration | Underline |
| Hover Color | `#085A85` |
| Transition | `color 150ms ease` |

---

## 4. Buttons

### 4.1 Primary Button

| Property | Value |
|----------|-------|
| Background | `linear-gradient(135deg, #0B6FA4, #0E87C7)` |
| Text Color | `#FFFFFF` |
| Font Size | 14px |
| Font Weight | 600 |
| Padding | `10px 20px` |
| Border Radius | `8px` |
| Border | None |
| Hover Background | `#085A85` (solid) |
| Active Transform | `scale(0.98)` |
| Transition | `all 150ms ease` |

### 4.2 Secondary Button

| Property | Value |
|----------|-------|
| Background | `transparent` |
| Border | `1.5px solid #0B6FA4` |
| Text Color | `#0B6FA4` |
| Font Size | 14px |
| Font Weight | 600 |
| Padding | `10px 20px` |
| Border Radius | `8px` |
| Hover Background | `#E1F0FA` |
| Active Transform | `scale(0.98)` |
| Transition | `all 150ms ease` |

### 4.3 Danger Button

| Property | Value |
|----------|-------|
| Background | `#C62828` |
| Text Color | `#FFFFFF` |
| Hover Background | `#B71C1C` |
| All other properties | Same as Primary Button |

### 4.4 Disabled Button

| Property | Value |
|----------|-------|
| Background | `#E2E8F0` |
| Text Color | `#94A3B8` |
| Cursor | `not-allowed` |
| Pointer Events | None |
| Box Shadow | None |

### 4.5 Button Icons

Prefer icon + text buttons over text-only buttons where context benefits from visual reinforcement. Use **Lucide React** or **Heroicons** as the icon set. Icons shall be 16px–18px inline with button text.

---

## 5. Form Inputs & Fields

### 5.1 Default State

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | `1.5px solid #CBD5E1` |
| Border Radius | `8px` |
| Padding | `10px 12px` |
| Font Size | 14px |
| Text Color | `#334155` |
| Placeholder Color | `#94A3B8` |

### 5.2 Focus State

| Property | Value |
|----------|-------|
| Border Color | `#0B6FA4` |
| Box Shadow | `0 0 0 3px rgba(11, 111, 164, 0.15)` |
| Transition | `border-color 200ms ease, box-shadow 200ms ease` |

### 5.3 Error State

| Property | Value |
|----------|-------|
| Border Color | `#C62828` |
| Box Shadow | `0 0 0 3px rgba(198, 40, 40, 0.1)` |

---

## 6. Cards & Containers

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | `1px solid #E2E8F0` |
| Border Radius | `12px` |
| Box Shadow | `0 1px 3px rgba(0, 0, 0, 0.06)` |
| Padding | `24px` |
| Hover Transform | `scale(1.01)` (where cards are clickable) |
| Hover Box Shadow | `0 4px 12px rgba(0, 0, 0, 0.08)` |
| Transition | `transform 200ms ease, box-shadow 200ms ease` |

### 6.1 Dashboard Stat Cards

| Property | Value |
|----------|-------|
| Left Border Accent | `4px solid #0B6FA4` or `4px solid #00897B` |
| Background | `#FFFFFF` (no full colored backgrounds) |
| All other properties | Same as standard card |

---

## 7. Sidebar Navigation

| Property | Value |
|----------|-------|
| Background | `linear-gradient(180deg, #1B2A4A, #162240)` |
| Width | `240px–260px` (collapsible) |

### 7.1 Navigation Items

| State | Properties |
|-------|------------|
| Default | Text `#CBD5E1`, font-size 14px, font-weight 500 |
| Hover | Background `rgba(255, 255, 255, 0.05)` |
| Active | Background `rgba(255, 255, 255, 0.1)`, text `#FFFFFF`, left border `3px solid #00897B` |
| Section Dividers | `1px solid rgba(255, 255, 255, 0.08)` |

---

## 8. Tables

| Element | Properties |
|---------|------------|
| Header Background | `#F0F4F8` |
| Header Text | 12px, uppercase, font-weight 600, color `#64748B` |
| Row Border | `border-bottom: 1px solid #E2E8F0` |
| Cell Padding | `12px 16px` |
| Hover Row | Background `#F7FAFC` |
| Alternating Rows | Even rows `#F7FAFC`, odd rows `#FFFFFF` |

---

## 9. Spacing & Layout System

### 9.1 Base Unit

All spacing shall use an **8px base unit**. Permitted spacing values:

`4px | 8px | 12px | 16px | 24px | 32px | 48px | 64px`

### 9.2 Layout Spacing

| Context | Value |
|---------|-------|
| Page Padding | `32px` |
| Gap Between Cards | `24px` |
| Section Spacing | `32px` |
| Inner Card Padding | `24px` |
| Form Field Gap | `16px` |

### 9.3 Layout Method

Use **CSS Grid** and **Flexbox** exclusively. Floats and hacky margin workarounds are prohibited.

---

## 10. Modern UI Polish Requirements

These specifications ensure the application has a contemporary SaaS-grade feel and does not appear dated.

### 10.1 Frosted Glass Effects

| Context | Implementation |
|---------|----------------|
| Sticky Headers | `backdrop-filter: blur(12px); background: rgba(240, 244, 248, 0.85)` |
| Modal Overlays | `backdrop-filter: blur(8px); background: rgba(0, 0, 0, 0.5)` |

### 10.2 Micro-Interactions & Animations

| Element | Interaction |
|---------|-------------|
| Buttons (active/click) | `transform: scale(0.98)` |
| Inputs (focus) | Smooth border-color and box-shadow animation `200ms ease` |
| Cards (hover) | `transform: scale(1.01)` with elevated shadow |
| Tabs / Segmented Controls | Sliding active indicator with `200ms ease` transition |
| Modal Entry | `opacity 0→1` + `translateY(8px → 0)` over `200ms ease-out` |
| Modal Exit | `opacity 1→0` + `translateY(0 → 8px)` over `150ms ease-in` |
| Toast Notifications | Slide in from top-right with subtle shadow, auto-dismiss with fade-out |

### 10.3 Loading States

Use **skeleton loading placeholders** with animated shimmer effect instead of spinners wherever possible. Spinners are acceptable only for brief, indeterminate actions (e.g., button submission).

### 10.4 Badges & Tags

| Property | Value |
|----------|-------|
| Border Radius | `9999px` (pill shape) |
| Padding | `4px 12px` |
| Font Size | 12px, font-weight 500 |
| Background | Soft semantic fill (e.g., success badge: `#E8F5E9` with text `#2E7D32`) |

### 10.5 User Avatars

```css
border-radius: 50%;
box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #0B6FA4;
```

### 10.6 Empty States

All empty states shall include clean vector illustrations or meaningful icons with supportive text. Plain text-only empty states are not permitted.

### 10.7 Scrollbars

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
```

### 10.8 Border Rules

Maximum border width: `1px` for dividers and containers. Only exception: accent borders on stat cards (`4px`) and active nav items (`3px`). Thick, heavy borders that evoke dated UI are strictly prohibited.

---

## 11. Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| Contrast Ratio | All text must meet **WCAG 2.1 AA** minimum contrast ratios |
| Body text on white | ≥ 4.5:1 |
| Large text on white | ≥ 3:1 |
| Focus Indicators | All interactive elements must show visible focus ring |
| Focus Ring Style | `box-shadow: 0 0 0 3px rgba(11, 111, 164, 0.3)` |
| Keyboard Navigation | Full keyboard accessibility required for all interactive elements |
| Transition Respect | Respect `prefers-reduced-motion` — disable animations for users who opt out |

---

## 12. Icon System

| Property | Specification |
|----------|---------------|
| Library | **Lucide React** (primary) or **Heroicons** (secondary) |
| Default Size | 20px |
| Button Inline Size | 16px–18px |
| Stroke Width | 1.5px–2px |
| Color | Inherit from parent text color |

---

## 13. Prohibited Practices

The following are strictly prohibited across the entire application:

1. Use of pure black (`#000000`) for any text or background
2. Sharp corners (0px border-radius) on any interactive element — minimum `8px`
3. Decorative gradients or unnecessary drop shadows beyond specified values
4. Use of CSS floats for layout
5. Thick borders (>1px) on containers, cards, or dividers (except designated accent borders)
6. Spinners as the default loading pattern (use skeleton loaders)
7. Text-only empty states without illustration or iconography
8. Sudden pop-in for modals or overlays (must use transition animations)
9. Default browser scrollbar styling
10. Any styling that results in a dated, legacy, or cluttered visual appearance

---

## 14. Compliance & Sign-Off

By implementing the codebase according to this specification, the development team agrees that all delivered UI components, pages, and screens shall conform to the standards defined herein.

Any deviation from this contract must be documented, justified, and approved in writing before implementation.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Design Lead | | | |
| Development Lead | | | |
| Project Owner | | | |

---

*End of Document — Medical Software UI/UX Design System Contract v1.0*
