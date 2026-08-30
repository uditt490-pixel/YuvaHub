# UX/UI Design System & Motion Principles

This document defines the visual language, motion guidelines, and interaction
patterns for YuvaHub. It ensures consistency across all components and provides
exact configuration objects for common animations.

---

## 1. Motion Principles

### 1.1 Core Rules

1. **Purposeful motion.** Every animation must communicate something — a state
   change, a spatial relationship, or feedback. Never animate for decoration.
2. **Quick and subtle.** Users should feel the motion, not wait for it. Most
   transitions complete in 200–400ms.
3. **Consistent timing.** Use the standard durations and easing curves defined
   below. Avoid one-off custom values unless there is a clear reason.
4. **Respect user preferences.** Always wrap animated content in a
   `prefers-reduced-motion` check. See §1.5.
5. **Don't block interaction.** Animations should never prevent users from
   clicking, scrolling, or typing.

### 1.2 Standard Durations

| Token | Duration | Use Case |
|---|---|---|
| `instant` | 100ms | Tooltip appear, checkbox toggle |
| `fast` | 200ms | Hover states, button press, focus ring |
| `normal` | 300ms | Dropdown open/close, tab switch, accordion |
| `slow` | 400ms | Page transition, modal enter/exit |
| `deliberate` | 500ms | Hero section entrance, staggered list reveal |

### 1.3 Standard Easing Curves

| Token | Value | Use Case |
|---|---|---|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering the viewport |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving the viewport |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Expanding/collapsing content |
| `spring` | `{ type: "spring", stiffness: 300, damping: 30 }` | Playful entrances, bouncy feedback |
| `spring-gentle` | `{ type: "spring", stiffness: 200, damping: 25 }` | Card hover, subtle lift |

### 1.4 Framer Motion Presets

Use these exact configuration objects for common animations:

**Fade In**
```ts
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: "ease-out" },
};
```

**Slide Up (most common entrance)**
```ts
const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "ease-out" },
};
```

**Slide Up with Stagger (for lists)**
```ts
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "ease-out" },
};
```

**Scale Pop (for cards / modals)**
```ts
const scalePop = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
};
```

**Slide from Right (for panels / sidebars)**
```ts
const slideFromRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
};
```

**Hover Lift (for interactive cards)**
```ts
const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: "ease-out" } },
  whileTap: { scale: 0.98 },
};
```

**`whileInView` Scroll Reveal (for sections)**
```ts
const scrollReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "ease-out" },
};
```

### 1.5 Reduced Motion

Always respect the `prefers-reduced-motion` media query. Wrap animated
components in a check:

```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// In Framer Motion, disable animations when reduced motion is preferred:
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
  animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "ease-out" }}
/>
```

Or use a utility hook:

```tsx
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}
```

### 1.6 When NOT to Animate

- **Critical information** (error messages, form validation) — appear instantly.
- **Loading states** — use skeleton shimmer, not entrance animations.
- **Rapidly updating data** (live counters, stock tickers) — no transitions.
- **On pages where the user has enabled reduced motion.**
- **Scroll jacking** — never override native scroll behavior.

---

## 2. Color Palette

### 2.1 Light Theme

| Token | Hex | Semantic Use |
|---|---|---|
| `mist` | `#fcf9f2` | Page background, navbar |
| `surface` | `#ffffff` | Card backgrounds, inputs |
| `surface-secondary` | `#f6efe2` | Hover states, secondary backgrounds |
| `coal` | `#231f20` | Primary text, headings |
| `cacao` | `#603620` | Secondary text, sidebar active |
| `muted` | `#8c7569` | Placeholder text, timestamps |
| `rust` | `#b56b37` | Primary actions, CTAs, focus rings |
| `golden` | `#f3e4bd` | Accent highlights, badge backgrounds |
| `moss` | `#63703d` | Success indicators |
| `meadow` | `#b5c37c` | Light success backgrounds |
| `border` | `#e8ded1` | Card borders, dividers |

### 2.2 Dark Theme

| Token | Hex | Semantic Use |
|---|---|---|
| `background` | `#0B1120` | Page background |
| `surface` | `#111827` | Card backgrounds, navbar |
| `surface-secondary` | `#1E293B` | Hover states, secondary panels |
| `text-primary` | `#F8FAFC` | Primary text, headings |
| `text-secondary` | `#CBD5E1` | Secondary text |
| `muted` | `#94A3B8` | Placeholder text, timestamps |
| `primary-blue` | `#3B82F6` | Primary actions, CTAs |
| `orange-cta` | `#F97316` | Secondary CTA, accents |
| `border` | `#334155` | Card borders, dividers |

### 2.3 Semantic Color Rules

| Action | Light | Dark |
|---|---|---|
| Primary action (buttons, links) | `rust` (`#b56b37`) | `primary-blue` (`#3B82F6`) |
| Destructive action (delete, error) | `red-500` | `red-400` |
| Success feedback | `moss` (`#63703d`) | `emerald-500` |
| Warning | `amber-500` | `amber-400` |
| Info / neutral | `cacao` (`#603620`) | `text-secondary` |
| Disabled state | `muted` with 50% opacity | `muted` with 50% opacity |

---

## 3. Typography

### 3.1 Font Family

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

Always use the `Inter` font. Do not introduce additional font families.

### 3.2 Type Scale

| Role | Size | Weight | Tailwind Classes |
|---|---|---|---|
| Display (hero) | 40–52px | 800 | `text-[40px] font-extrabold` |
| H1 | 28–34px | 800 | `text-[28px] font-extrabold` |
| H2 | 20–24px | 700 | `text-[20px] font-bold` |
| H3 | 16–18px | 700 | `text-[17px] font-bold` |
| Body | 14–15px | 500–600 | `text-[14px] font-medium` or `text-[15px] font-semibold` |
| Caption | 12–13px | 600 | `text-[12px] font-semibold` |
| Badge / Tag | 9–11px | 700–800 | `text-[10px] font-bold` or `text-[9px] font-extrabold` |

### 3.3 Heading Hierarchy Rules

1. **Every page section** must start with an H2 or H3 — never skip levels.
2. **Maximum line length** for body text: 65–75 characters. Use `max-w-prose` or
   `max-w-2xl`.
3. **Line height:** 1.5 for body, 1.2 for headings.
4. **Letter spacing:** `tracking-tight` for headings, default for body.
5. **Color:** Headings use `text-primary`, body uses `text-secondary` or
   `text-muted` depending on importance.

---

## 4. Z-Index Hierarchy

Use a consistent z-index scale to prevent stacking conflicts:

| Layer | Z-Index | Use |
|---|---|---|
| Base content | `0` | Default page content |
| Sticky sidebar | `10` | Sidebar navigation |
| Dropdown menus | `30` | Navigation dropdowns, user menus |
| Mobile header | `40` | Fixed mobile top bar |
| Mobile menu overlay | `45` | Full-screen mobile nav |
| Announcement banner | `50` | Top-of-page announcements |
| Sticky header | `50` | Desktop top bar |
| Modal backdrop | `60` | Modal overlay / backdrop |
| Modal content | `70` | Modal dialog, drawers |
| Tooltip | `80` | Hover tooltips |
| Skip link (focus) | `90` | Accessibility skip-to-content |
| Loading overlay | `100` | Full-screen loading states |

### 4.1 Rules

1. **Never use `z-[9999]`** — it breaks the scale. Use the tokens above.
2. **Never use `z-index` on elements that don't need it** — let natural stacking
   handle most content.
3. **Modal + backdrop** must always be paired: backdrop at `z-60`, content at
   `z-70`.
4. **Tooltips** (`z-80`) must always appear above modals (`z-70`).

---

## 5. Spacing & Layout

### 5.1 Standard Spacing

| Context | Value | Tailwind |
|---|---|---|
| Inline elements | 4–8px | `gap-1` to `gap-2` |
| Card padding | 16–20px | `p-4` to `p-5` |
| Section spacing | 32–48px | `gap-8` to `gap-12` |
| Page padding | 16–24px | `px-4` to `px-6` |

### 5.2 Border Radius

| Element | Radius | Tailwind |
|---|---|---|
| Buttons | 8–10px | `rounded-[8px]` to `rounded-[10px]` |
| Cards | 12–16px | `rounded-xl` to `rounded-2xl` |
| Avatars | 50% | `rounded-full` |
| Badges | 6–8px | `rounded-md` to `rounded-lg` |

### 5.3 Shadows

| Level | Usage | Tailwind |
|---|---|---|
| Subtle | Cards at rest | `shadow-xs` |
| Medium | Cards on hover, dropdowns | `shadow-md` |
| Strong | Modals, floating elements | `shadow-lg` or `shadow-xl` |

---

## 6. Accessibility

1. **Focus indicators:** Every interactive element must have a visible focus
   ring: `focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
   focus-visible:ring-offset-2`.
2. **Color contrast:** All text must meet WCAG AA (4.5:1 for body, 3:1 for
   large text).
3. **Touch targets:** Minimum 44×44px for all interactive elements on mobile.
4. **Screen readers:** Use `aria-label`, `aria-hidden`, and semantic HTML
   elements (`<nav>`, `<main>`, `<section>`, `<button>`).
5. **Animation:** Respect `prefers-reduced-motion` — see §1.5.
