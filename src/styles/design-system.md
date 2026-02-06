# Design System - Quizzical

## 🎨 Design Tokens

### Colors

#### Base Colors

| Token | OKLCH Value | HEX | Usage |
|-------|-------------|-----|-------|
| `--color-background` | `oklch(97.6% 0.006 264.5)` | `#F5F7FB` | Main application background |
| `--color-surface` | `oklch(100% 0 0)` | `#FFFFFF` | Cards and elements surface |

#### Primary Colors

| Token | OKLCH Value | HEX | Usage |
|-------|-------------|-----|-------|
| `--color-primary` | `oklch(49.2% 0.108 272.9)` | `#4D5B9E` | Primary action buttons |
| `--color-primary-light` | `oklch(54.1% 0.090 285.3)` | `#6A67A1` | Light variant |
| `--color-primary-dark` | `oklch(33.7% 0.088 273.1)` | `#293264` | Main text, titles |

#### Secondary Colors / States

| Token | OKLCH Value | HEX | Usage |
|-------|-------------|-----|-------|
| `--color-selected` | `oklch(89.6% 0.036 277.0)` | `#D6DBF5` | Selected answers background |
| `--color-correct` | `oklch(82.0% 0.101 150.3)` | `#94D7A2` | Correct answer |
| `--color-incorrect` | `oklch(85.0% 0.069 18.6)` | `#F8BCBC` | Incorrect answer |

#### Decorative Colors

| Token | OKLCH Value | HEX | Usage |
|-------|-------------|-----|-------|
| `--color-blob-yellow` | `oklch(97.9% 0.053 101.6)` | `#FFFAD1` | Yellow decorative shape |
| `--color-blob-blue` | `oklch(93.4% 0.023 248.1)` | `#DEEBF8` | Blue decorative shape |

#### Border and Text Colors

| Token | OKLCH Value | HEX | Usage |
|-------|-------------|-----|-------|
| `--color-text-primary` | `oklch(33.7% 0.088 273.1)` | `#293264` | Primary text |
| `--color-text-secondary` | `oklch(49.2% 0.108 272.9)` | `#4D5B9E` | Secondary text |
| `--color-text-inverse` | `oklch(100% 0 0)` | `#FFFFFF` | Text on colored background |
| `--color-border` | `oklch(90.4% 0.025 278.3)` | `#DBDEF0` | Unselected button borders |
| `--color-divider` | `oklch(90.4% 0.025 278.3)` | `#DBDEF0` | Divider lines |

---

### Typography

#### Font Family

| Token | Value |
|-------|-------|
| `--font-family` | `'Karla', 'Inter', sans-serif` |

#### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | `12px` | Very small text |
| `--font-size-sm` | `14px` | Small text, labels |
| `--font-size-base` | `16px` | Body text, buttons |
| `--font-size-lg` | `18px` | Score, subtitles |
| `--font-size-xl` | `24px` | Question titles |
| `--font-size-2xl` | `32px` | Main title (Quizzical) |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | `400` | Body text |
| `--font-weight-medium` | `500` | Answer buttons |
| `--font-weight-semibold` | `600` | Action buttons, score |
| `--font-weight-bold` | `700` | Titles |

#### Line Height

| Token | Value |
|-------|-------|
| `--line-height-tight` | `1.2` |
| `--line-height-normal` | `1.5` |
| `--line-height-relaxed` | `1.75` |

---

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | `4px` | Micro spacing |
| `--spacing-sm` | `8px` | Spacing between close elements |
| `--spacing-md` | `16px` | Standard spacing |
| `--spacing-lg` | `24px` | Spacing between question and answers |
| `--spacing-xl` | `32px` | Spacing between sections |
| `--spacing-2xl` | `48px` | Large spacing (between question blocks) |
| `--spacing-3xl` | `64px` | Very large spacing |

---

### Borders

#### Border Width

| Token | Value |
|-------|-------|
| `--border-width-thin` | `1px` |
| `--border-width-medium` | `2px` |

#### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--border-radius-sm` | `8px` | Small elements |
| `--border-radius-md` | `10px` | Action buttons (Check answers, Play again) |
| `--border-radius-lg` | `15px` | Primary buttons (Start quiz) |
| `--border-radius-full` | `9999px` | Pill buttons (answers) |

---

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-none` | `none` | Answer buttons |
| `--shadow-sm` | `0 2px 4px rgba(77, 91, 158, 0.1)` | Light elevation |
| `--shadow-md` | `0 4px 12px rgba(77, 91, 158, 0.15)` | Primary action buttons |

---

## 🏷️ Utility Classes (Tailwind v4)

### Colors

| Class | Usage |
|-------|-------|
| `bg-background` | Main background |
| `bg-surface` | White surface |
| `bg-primary` | CTA button |
| `bg-primary-light` | Light variant |
| `bg-primary-dark` | Dark background |
| `bg-selected` | Selected answer |
| `bg-correct` | Correct answer |
| `bg-incorrect` | Incorrect answer |
| `bg-blob-yellow` | Yellow decorative blob |
| `bg-blob-blue` | Blue decorative blob |
| `text-primary-dark` | Primary text |
| `text-primary` | Secondary text |
| `border-border` | Standard border |

### Typography

| Class | Result |
|-------|--------|
| `font-sans` | Karla, Inter |
| `text-2xl font-bold` | Main title |
| `text-xl font-bold` | Question title |
| `text-base` | Description |
| `text-sm font-medium` | Answer button |

### Spacing

| Class | Value |
|-------|-------|
| `p-xs` / `m-xs` | 0.25rem (4px) |
| `p-sm` / `m-sm` | 0.5rem (8px) |
| `p-md` / `m-md` | 1rem (16px) |
| `p-lg` / `m-lg` | 1.5rem (24px) |
| `p-xl` / `m-xl` | 2rem (32px) |
| `p-2xl` / `m-2xl` | 3rem (48px) |
| `gap-sm` | 0.5rem (between answer buttons) |

### Borders

| Class | Result |
|-------|--------|
| `rounded-sm` | 0.5rem (8px) |
| `rounded-md` | 0.625rem (10px) |
| `rounded-lg` | 0.9375rem (15px) |
| `rounded-full` | Pill |

---