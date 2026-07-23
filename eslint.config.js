import fs from 'node:fs'
import path from 'node:path'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// The global '@/features' barrel re-exports every feature's entire module graph (pages, forms,
// API clients, ...) — importing it anywhere that's eagerly loaded (e.g. the sidebar used to)
// silently pulls all of that into the main bundle and defeats every route's lazy() code-
// splitting. Import the specific feature/subpath actually needed instead.
const GLOBAL_FEATURES_BARREL_BLOCK = {
  name: '@/features',
  message:
    "Import from the specific feature instead, e.g. '@/features/menus/hooks' — importing the global '@/features' barrel eagerly bundles every feature together (see the comment above this rule in eslint.config.js).",
}

// Each feature module is normally siloed — cross-feature imports are the exception, not the
// rule. Only list a pair here if it's a genuine, reviewed composition (e.g. a form that looks
// up another feature's dropdown options), not just because a bare import happens to resolve.
const ALLOWED_CROSS_FEATURE_IMPORTS = {
  users: ['roles', 'branches', 'approvals'],
  'role-permissions': ['roles', 'menus'],
  // The dynamic-form-engine demo/POC page composes the products feature's own data directly.
  'demo-forms': ['products'],
  // The maker-checker approval review modal (list pages' pending-request review flow) is a
  // shared cross-cutting feature, not something each module reimplements — every listing that
  // shows approval status/actions composes it directly. Branches has since migrated to its own
  // per-module approve/reject (see features/branches/api/branchesApi.ts) and no longer imports
  // this — Menus/Roles still use the shared global endpoint.
  menus: ['approvals'],
  roles: ['approvals'],
}

const FEATURES_DIR = path.join(import.meta.dirname, 'src/features')
const FEATURES = fs
  .readdirSync(FEATURES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => entry.name)

const featureBoundaryConfigs = FEATURES.map((feature) => {
  const allowed = new Set(ALLOWED_CROSS_FEATURE_IMPORTS[feature] ?? [])
  const blocked = FEATURES.filter((other) => other !== feature && !allowed.has(other))

  return {
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [GLOBAL_FEATURES_BARREL_BLOCK],
          patterns: blocked.map((other) => ({
            group: [`@/features/${other}`, `@/features/${other}/**`],
            message: `'${feature}' must not import from '${other}' — features stay siloed except for the reviewed composition exceptions in eslint.config.js's ALLOWED_CROSS_FEATURE_IMPORTS. If this is a new, intentional dependency, add it there.`,
          })),
        },
      ],
    },
  }
})

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': ['error', { paths: [GLOBAL_FEATURES_BARREL_BLOCK] }],
      // A leading underscore is this codebase's convention for "destructured on purpose to
      // discard" (e.g. `const { role_id: _roleId, ...rest } = input`), used throughout the
      // mapper functions that strip a write-only field before spreading the rest onto a
      // read-shaped type. The default recommended config doesn't recognize that convention.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  ...featureBoundaryConfigs,
])
