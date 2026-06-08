# Contributing to CourTier Frontend

We welcome contributions to CourTier! To maintain high code quality, performance, and accessibility, please follow these guidelines when writing code.

---

## 🛠 Guidelines

### 1. Code Style & Quality
*   **TypeScript**: Every file must be fully typed. Avoid using `any`.
*   **Naming Conventions**:
    *   React Components: PascalCase (e.g. `CaseCard.tsx`).
    *   Utilities & Hooks: camelCase (e.g. `useSeo.ts`, `utils.ts`).
    *   Variables & Functions: camelCase.
    *   CSS classes: kebab-case.
*   **Imports**: Use absolute path aliases (prefixed with `@/`) to reference internal folders (e.g. `import { Button } from '@/components/ui/Button'`).

### 2. Design System Consistency
*   Do not write ad-hoc utility classes for colors, shadows, or borders if they are defined as standard components.
*   Leverage existing design system primitives from `src/components/ui/` (Button, Input, Badge, Modal, etc.).
*   Ensure dark and light mode variable compatibility inside `src/index.css`.

### 3. Accessibility Standards
*   Ensure all form controls have an associated `<label>` or `aria-label`.
*   All icon-only buttons must specify a descriptive `aria-label`.
*   Never remove focus outlines (`outline-none`) without providing keyboard-focusable styles.
*   Verify that new text elements adhere to WCAG AA contrast ratios (>4.5:1).

### 4. Performance & Bundle Optimization
*   Use lazy loading (`React.lazy()`) for views that are mounted on routes.
*   Wrap expensive callback handlers inside `useCallback` or `useMemo` to minimize re-renders.

---

## 📈 Development Workflow

1.  **Branch Naming**:
    *   `feature/feature-name` for new features.
    *   `bugfix/bug-name` for fixes.
    *   `chore/task-name` for refactors and maintenance tasks.
2.  **Verification Steps**:
    *   Before submitting changes, make sure the project compiles and lint checks pass:
        ```bash
        npm run lint
        npm run build
        ```
