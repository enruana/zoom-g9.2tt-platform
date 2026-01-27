# Story 1.1: Initialize Vite Project with React and TypeScript

Status: review

## Story

As a **developer**,
I want **a properly configured Vite + React + TypeScript project**,
so that **I have a solid foundation to build the application**.

## Acceptance Criteria

1. **AC1:** Project created with `npm create vite@latest zoom-g9.2tt-web -- --template react-ts` ✅
2. **AC2:** Project compiles without errors using `npm run build` ✅
3. **AC3:** Dev server starts successfully with `npm run dev` ✅
4. **AC4:** TypeScript configured with strict mode enabled ✅
5. **AC5:** ESLint configured for React + TypeScript ✅

## Tasks / Subtasks

- [x] Task 1: Initialize Vite project (AC: 1)
  - [x] Run `npm create vite@latest zoom-g9.2tt-web -- --template react-ts`
  - [x] Navigate into project directory
  - [x] Run `npm install` to install dependencies

- [x] Task 2: Verify build and dev server (AC: 2, 3)
  - [x] Run `npm run build` and verify no errors
  - [x] Run `npm run dev` and verify server starts on localhost
  - [x] Access http://localhost:5173 and verify React app loads

- [x] Task 3: Configure TypeScript strict mode (AC: 4)
  - [x] Open `tsconfig.json`
  - [x] Verify `"strict": true` is set
  - [x] Verify `"noUncheckedIndexedAccess": true` for extra safety
  - [x] Set target to `"ES2020"` for modern browser support

- [x] Task 4: Configure ESLint (AC: 5)
  - [x] Verify ESLint config exists (Vite template includes it)
  - [x] Ensure React and TypeScript rules are enabled
  - [x] Run `npm run lint` and verify no errors
  - [x] Add `.eslintignore` if needed for build artifacts

- [x] Task 5: Clean up default Vite template
  - [x] Remove default Vite logo and assets
  - [x] Simplify `App.tsx` to minimal component
  - [x] Clean up `index.css` (remove Vite defaults)
  - [x] Update `index.html` title to "G9.2tt Editor"

## Dev Notes

### Architecture Compliance

**From architecture.md:**
- Use `npm create vite@latest zoom-g9.2tt-web -- --template react-ts`
- TypeScript 5.x with strict mode
- Target: ES2020+ (modern browsers)
- Vite for dev server and production builds
- Rollup for production bundling (automatic with Vite)

### Technical Requirements

**Node.js Version:** 18.x or 20.x LTS recommended
**Package Manager:** npm (not yarn or pnpm for consistency)

**tsconfig.json requirements:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

### Project Location

**CRITICAL:** Create the project inside a new folder `zoom-g9.2tt-web/` within the repository root.

The final structure after this story:
```
zoom-g9.2tt-platform/
├── phases/           # Existing reverse engineering work
├── tools/            # Existing Python tools
├── zoom-g9.2tt-web/  # NEW: Web application (created by this story)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── eslint.config.js
└── ...
```

### ESLint Configuration

Vite 6.x uses ESLint 9.x with flat config format (`eslint.config.js` not `.eslintrc`).

Default template includes:
- `@eslint/js` - Core ESLint rules
- `typescript-eslint` - TypeScript support
- `eslint-plugin-react-hooks` - React hooks rules
- `eslint-plugin-react-refresh` - Fast refresh support

### Testing Standards

Testing setup is **NOT** part of this story (covered in Epic 1 as optional). Focus only on project initialization.

### References

- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Post-Initialization Setup Required]
- [Source: epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created Vite project with React + TypeScript template (v8.2.0 create-vite)
- Installed 175 npm packages successfully
- Build passes: 193KB JS bundle, 0.26KB CSS
- Dev server starts correctly on localhost:5173
- TypeScript configured with strict mode, noUncheckedIndexedAccess, and ES2020 target
- ESLint passes with 0 errors using flat config format
- Cleaned up default Vite template (removed logos, assets, demo content)
- Updated title to "G9.2tt Editor"

### File List

**Created:**
- `zoom-g9.2tt-web/` - New web application directory
- `zoom-g9.2tt-web/package.json` - Project manifest
- `zoom-g9.2tt-web/package-lock.json` - Dependency lockfile
- `zoom-g9.2tt-web/tsconfig.json` - TypeScript project references
- `zoom-g9.2tt-web/tsconfig.app.json` - App TypeScript config (modified: ES2020 target, noUncheckedIndexedAccess)
- `zoom-g9.2tt-web/tsconfig.node.json` - Node TypeScript config
- `zoom-g9.2tt-web/vite.config.ts` - Vite configuration
- `zoom-g9.2tt-web/eslint.config.js` - ESLint flat config
- `zoom-g9.2tt-web/index.html` - HTML entry (modified: title to "G9.2tt Editor")
- `zoom-g9.2tt-web/src/main.tsx` - React entry point
- `zoom-g9.2tt-web/src/App.tsx` - Root component (modified: minimal content)
- `zoom-g9.2tt-web/src/index.css` - Global styles (modified: clean base styles)
- `zoom-g9.2tt-web/src/vite-env.d.ts` - Vite type definitions

**Removed (from default template):**
- `zoom-g9.2tt-web/public/vite.svg`
- `zoom-g9.2tt-web/src/assets/` directory
- `zoom-g9.2tt-web/src/App.css`
