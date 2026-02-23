# Elevates Executive AI Decision Engine

## Project Overview
High-end executive dashboard with glassmorphism design, 5 distinct views, and AI-powered insights.

## Tech Stack
- **Framework**: Next.js 15+ (App Router, RSC)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + CSS variables for glassmorphism
- **Components**: Shadcn UI
- **Charts**: Recharts
- **Icons**: Lucide-react
- **State**: Zustand (global), React hooks (local)
- **Validation**: Zod schemas
- **Mock Data**: Faker.js

## Architecture
Clean Architecture with layered separation:
- `src/core/` - Domain layer (framework-agnostic business logic)
- `src/infrastructure/` - Adapters (repositories, services)
- `src/presentation/` - UI components and hooks
- `src/shared/` - Cross-cutting concerns (schemas, types, utils)
- `src/store/` - Zustand state management

## Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `GlassCard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-crisis-mode.ts`)
- Stores: `kebab-case.store.ts` (e.g., `crisis.store.ts`)
- Schemas: `kebab-case.schema.ts` or consolidated in `index.ts`

### Import Aliases
- `@/*` - Root src directory
- Always use absolute imports via the alias

### Component Structure
```tsx
// 1. Imports (external, then internal)
// 2. Types/interfaces
// 3. Component definition
// 4. Export (prefer named exports)
```

### Styling
- Use Tailwind utility classes
- Glassmorphism effects via CSS custom properties
- Color variables defined in globals.css

### State Management
- Local state: `useState`, `useReducer`
- Global state: Zustand stores
- Server state: React Server Components where possible

## Brand Colors
- Primary: Deep Blue (#1E3A8A)
- Success: Emerald (#059669)
- Warning: Amber (#D97706)
- Danger: Red (#DC2626)
- Muted: Slate (#64748B)

## Responsive Breakpoints
- xs: 375px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
- 3xl: 1920px
- 4k: 2560px

## Commands
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```
