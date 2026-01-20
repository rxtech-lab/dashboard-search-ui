# CLAUDE.md

## Project Overview
This is a React component library built with Vite, Tailwind CSS v4, shadcn/ui, and framer-motion.

## Tech Stack
- **Build**: Vite (library mode) with single JS output + CSS injection
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Components**: shadcn/ui (new-york style)
- **Animation**: framer-motion
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Bun

## Project Structure
```
searching-ui/
├── src/                  # Library source code
│   ├── index.ts          # Main entry point (exports all)
│   ├── styles.css        # Tailwind CSS entry
│   ├── lib/utils.ts      # cn() utility for shadcn
│   ├── components/ui/    # shadcn components
│   └── test/setup.ts     # Vitest setup
├── example/              # Example app for previewing components
├── dist/                 # Build output (single JS + types)
└── components.json       # shadcn configuration
```

## Common Commands
```bash
bun run build           # Build the library
bun run test            # Run tests
bun run example:dev     # Build lib + run example dev server
bun run example:build   # Build lib + build example
```

## Adding shadcn Components
```bash
bunx shadcn@latest add button
```
Then export from `src/index.ts`:
```typescript
export * from './components/ui/button'
```

## Build Output
The library builds to a single ES module with CSS injected:
- `dist/searching-ui.js` - Single JS file with styles
- `dist/index.d.ts` - TypeScript declarations

## Path Aliases
Use `@/` to reference `src/`:
```typescript
import { cn } from '@/lib/utils'
```

## Testing
Tests use Vitest with jsdom environment. Place test files next to components:
```
src/components/ui/Button/
├── Button.tsx
├── Button.test.tsx
└── index.ts
```
