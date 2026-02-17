# Quizzical

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Coverage](https://img.shields.io/badge/Coverage-98.96%25-brightgreen)](./coverage/)
[![Tests](https://img.shields.io/badge/Tests-135_passing-brightgreen)]()

> A modern, interactive trivia quiz app built with React 19 & TypeScript in strict mode. Designed to showcase clean architecture, robust error handling, and professional-grade testing.

---

## Features

- **Interactive quiz** with trivia questions from [Open Trivia DB](https://opentdb.com/)
- **Session persistence** - resume your quiz where you left off (SessionStorage caching)
- **Resilient networking** - automatic retry with exponential backoff, request deduplication
- **Typed error handling** - custom error classes with type guards for safe discrimination
- **Optimized rendering** - React 19 Compiler for automatic memoization

---

## Architecture

The project follows a **layered architecture** with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  Components (UI)   ·   Hooks (Logic)   ·   Context       │
│  HomeScreen        ·   useQuiz         ·   QuizAnswers   │
│  QuestionsScreen   ·                   ·                  │
│  AnswersScreen     ·                   ·                  │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                     BUSINESS LAYER                        │
│  QuizService: API data → domain model transformation     │
│  Reducer: pure state machine (useReducer)                │
│  Score calculation, validation                           │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                   INFRASTRUCTURE LAYER                    │
│  HttpClient          StorageService       State Manager  │
│  (retry, timeout,    (Strategy Pattern,   (useReducer,   │
│   abort, backoff)     versioned entries)   typed actions) │
└──────────────────────────────────────────────────────────┘
```

### Design patterns used

| Pattern | Where | Why |
|---------|-------|-----|
| **Strategy** | `StorageService` | Pluggable storage backend (SessionStorage, easily swappable to LocalStorage or IndexedDB) |
| **Service Layer** | `QuizService` | Isolate API transformation logic from UI concerns |
| **State Machine** | `reducer.ts` | Predictable state transitions with typed actions |
| **Custom Hook** | `useQuiz` | Encapsulate complex stateful logic, orchestrate services |
| **Context** | `QuizAnswersContext` | Share answer state through the component tree without prop drilling |
| **Type Guards** | `errors.ts` | Runtime-safe error discrimination with `isApiError`, `isNetworkError` |

---

## Highlights for reviewers

### 1. Robust HTTP client with retry

The HTTP client (`src/services/api/client.ts`) implements:
- Exponential backoff retry (1s, 2s, 4s...) on 5xx and network errors only
- Configurable timeout via `AbortController`
- No retry on 4xx client errors (fail fast on bad requests)
- Clean error classification into `ApiError` / `NetworkError`

### 2. Request deduplication

The `useQuiz` hook uses a `useRef` flag to prevent concurrent API calls. If `loadQuiz()` is called while a request is already in flight, the second call returns immediately - preventing race conditions without complex cancellation logic.

### 3. Smart caching with config awareness

Questions are cached in SessionStorage with their associated config. On reload, the cache is only reused if the config (amount, category, difficulty, type) matches exactly. User answers are persisted independently and cleared only when loading a new quiz with a different config.

### 4. Typed state management

The reducer handles 7 action types with full TypeScript discrimination:

```typescript
type QuizAction =
  | { type: 'LOAD_START'; config: QuizConfig }
  | { type: 'LOAD_SUCCESS'; questions: QuizQuestion[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'SELECT_ANSWER'; questionId: string; answerId: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CACHE' }
  | { type: 'CHANGE_SCREEN'; screen: Screen }
```

### 5. Custom error hierarchy with type guards

```typescript
class ApiError extends Error { status: number; code?: string; }
class NetworkError extends Error { }
class ValidationError extends Error { }

// Safe runtime discrimination
function isApiError(error: unknown): error is ApiError { ... }
```

---

## Testing

```bash
npm run test              # run all tests
npm run test:watch        # watch mode
npm run test:coverage     # coverage report
npm run test:ui           # visual test runner (Vitest UI)
```

### Coverage

| Metric | Coverage |
|--------|----------|
| **Statements** | 98.96% |
| **Branches** | 95.45% |
| **Functions** | 100% |
| **Lines** | 98.96% |

### 135 tests across 7 test files

| Test file | Tests | What it covers |
|-----------|-------|----------------|
| `useQuiz.test.ts` | 44 | Hook lifecycle, caching, error states, request deduplication, answer persistence |
| `reducer.test.ts` | 30 | Every action type, state immutability, edge cases |
| `StorageService.test.ts` | 22 | Strategy pattern, versioned entries, error handling, null cases |
| `QuizService.test.ts` | 14 | API transformation, HTML decoding, shuffling, validation |
| `client.test.ts` | 14 | Retry logic, timeout, backoff, error classification |
| `endpoints.test.ts` | 8 | URL building with all config combinations |
| `quiz-flow.integration.test.ts` | 3 | Full flow from fetch to state with mocked API |

### Testing approach

- **Unit tests** with mocked dependencies (`vi.mock`, `vi.fn`)
- **Integration tests** validating the full fetch-to-state pipeline
- **Arrange-Act-Assert** pattern in every test
- **Edge case coverage**: concurrent requests, cache invalidation, network failures, timeouts, HTML entity decoding
- **Async testing** with `renderHook`, `act`, `waitFor` from React Testing Library

---

## Tailwind CSS & Design System

This project uses **Tailwind CSS v4** with a fully custom design system — no `tailwind.config.js`, everything is handled through CSS layers and the new `@theme` directive.

### Architecture

```
src/
├── index.css                    # @theme block: maps tokens → Tailwind utilities
├── styles/
│   ├── base/
│   │   └── index.css            # @layer base: design tokens (OKLCH colors, typography, spacing)
│   ├── components/
│   │   ├── button.css           # .btn variants with CSS custom properties
│   │   ├── answer.css           # .answer states (selected, correct, incorrect)
│   │   ├── main.css             # Background with decorative SVG blobs
│   │   └── loading.css          # Animated loaders via SVG masks
│   └── design-system.md         # Full token reference documentation
└── utils/
    └── tailwind-cn.ts           # cn() = clsx + tailwind-merge
```

### Design tokens with OKLCH color space

All colors are defined in OKLCH for perceptually uniform transitions and better accessibility contrast:

```css
@layer base {
  :root {
    --token-color-primary: oklch(49.2% 0.108 272.9);
    --token-color-correct: oklch(72% 0.14 150);
    --token-color-incorrect: oklch(62% 0.18 22);
    /* ... 25+ tokens: colors, typography, spacing, radius, shadows */
  }
}
```

These tokens are then exposed to Tailwind via the `@theme` block, so they work as standard utilities (`bg-primary`, `text-correct`, `shadow-md`, etc.):

```css
@theme {
  --color-primary: var(--token-color-primary);
  --spacing-lg: var(--token-spacing-lg);
  --radius-md: var(--token-radius-md);
  /* ... */
}
```

### Component classes with CSS custom properties

Button and answer components use scoped CSS custom properties for state management, keeping variants clean and composable:

```css
/* Button with internal state variables */
.btn {
  --_btn-bg: var(--token-color-primary);
  --_btn-fg: var(--token-color-surface);
  @apply inline-flex items-center justify-center text-sm lg:text-base font-semibold;
  @apply cursor-pointer select-none transition-all duration-150;
}
.btn-outline { --_btn-bg: transparent; --_btn-fg: var(--token-color-primary); }
.btn-soft    { --_btn-bg: var(--token-color-primary-light); }

/* Answer with conditional hover that respects state */
.answer:hover:not(.answer-selected):not(.answer-correct):not(.answer-incorrect) {
  transform: translateY(-1px);
  box-shadow: var(--token-shadow-sm);
}
```

### Class composition with `cn()`

Safe merging of conditional Tailwind classes with conflict resolution:

```tsx
// cn() = clsx (conditionals) + twMerge (conflict resolution)
<button className={cn(
  "answer",
  isSelected && "answer-selected",
  isCorrect && "answer-correct",
  isIncorrect && "answer-incorrect",
)} />
```

### What this showcases

| Aspect | Detail |
|--------|--------|
| **Tailwind v4 mastery** | `@theme`, `@layer`, Vite plugin — no JS config needed |
| **Design token system** | 25+ tokens covering colors, typography, spacing, radius, shadows |
| **OKLCH colors** | Modern color space for perceptually consistent palette |
| **CSS architecture** | Layered organization (`base` → `components`), scoped custom properties |
| **Responsive design** | Multiple breakpoints (`md`, `lg`, custom `425px`) with responsive padding and typography |
| **Micro-interactions** | Hover lift, active scale, focus-visible outlines, smooth transitions |
| **Loading animations** | Multiple animated loaders (spinner, dots, ring, bars) via SVG masks |
| **Documentation** | Full design system reference in `design-system.md` |

---

## Tech stack

### Core

| Technology | Version | Role |
|------------|---------|------|
| React | 19.2 | UI library with React Compiler enabled |
| TypeScript | 5.9 | Strict mode with all safety flags |
| Vite | 7.2 | Build tool with HMR |
| Tailwind CSS | 4.1 | Custom design system with OKLCH tokens, `@theme`, layered CSS |

### Testing & quality

| Technology | Role |
|------------|------|
| Vitest + @vitest/ui | Unit & integration tests with visual runner |
| React Testing Library | Behavior-driven DOM testing |
| @vitest/coverage-v8 | Code coverage reporting |
| ESLint | TypeScript-aware linting |
| Prettier | Consistent formatting |
| Husky + lint-staged | Pre-commit: lint + run related tests on staged files |

### TypeScript config

All safety flags enabled:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

---

## Project structure

```
src/
├── components/
│   ├── pages/               # Screen components (Home, Config, Questions, Answers)
│   ├── Button.tsx           # Reusable button with variant support
│   ├── Answer.tsx           # Answer option component
│   ├── AnswersChoicesList.tsx
│   └── QuestionWrapper.tsx
│
├── hooks/
│   ├── useQuiz.ts           # Main hook: state, caching, API orchestration
│   └── __tests__/           # 44 tests
│
├── services/
│   ├── api/                 # Generic HTTP client with retry & timeout
│   ├── quiz/                # QuizService: fetch, transform, validate
│   └── storage/             # StorageService with Strategy pattern
│
├── state/
│   └── quiz/
│       ├── reducer.ts       # Pure reducer (state machine)
│       └── types.ts         # State & action type definitions
│
├── context/
│   └── answers/             # React Context for user answer state
│
├── utils/
│   ├── errors.ts            # Custom error classes & type guards
│   ├── getQuizScore.ts      # Score calculation
│   └── tailwind-cn.ts       # clsx + tailwind-merge utility
│
└── test/
    ├── setup.ts             # Vitest global setup
    └── integration/         # End-to-end flow tests
```

---

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
git clone https://github.com/ton-username/quizzical.git
cd quizzical
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run typecheck` | TypeScript check (no emit) |

---

## What this project demonstrates

| Skill | How it's demonstrated |
|-------|----------------------|
| **Clean architecture** | Layered design with clear boundaries between UI, business logic, and infrastructure |
| **TypeScript mastery** | Strict mode, discriminated unions, type guards, generics in services |
| **Testing discipline** | 135 tests, ~99% coverage, unit + integration, edge cases, async patterns |
| **Error handling** | Custom error hierarchy, user-friendly messages, retry with backoff |
| **State management** | Pure reducer, typed actions, predictable transitions, immutable state |
| **Performance** | React Compiler, request deduplication, smart caching |
| **Code quality automation** | Pre-commit hooks running lint + related tests on every commit |
| **Tailwind CSS & design system** | Custom `@theme`, OKLCH design tokens, layered CSS architecture, component variants with CSS custom properties |
| **Design patterns** | Strategy, Service Layer, State Machine, Custom Hooks, Context |

---

## License

MIT
