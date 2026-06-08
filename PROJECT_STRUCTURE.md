# CourTier Project Directory Structure & Monorepo Migration Blueprint

This document details the directory structure of the **CourTier** React client tracker application and provides a step-by-step structural roadmap for migrating it into a monorepo structure.

---

## 📁 Present Directory Structure

```
courtier-frontend/
├── public/                 # Static public-facing assets & PWA definitions
│   ├── icons/              # Multi-size app icons & launcher images
│   ├── favicon.svg         # Default browser icon
│   ├── manifest.json       # PWA Application Launcher definitions
│   ├── robots.txt          # Crawler indexing access constraints
│   ├── sitemap.xml         # Public indexable route listings
│   └── sw.js               # Service Worker caching scripts
│
├── src/
│   ├── api/
│   │   └── index.ts        # Axios client instance with retry logic & refresh queues
│   ├── components/
│   │   ├── case/           # Case cards, captcha prompts, and timeline panels
│   │   ├── layout/         # App navigation shells, route protections, and PWA banners
│   │   └── ui/             # Reusable design system controls (Button, Input, Badge, Toast)
│   ├── hooks/
│   │   └── useSeo.ts       # Custom SEO, OpenGraph, and JSON-LD metadata injector
│   ├── lib/
│   │   ├── brand.ts        # Logo references and themes mappings
│   │   └── utils.ts        # Date/Time parser functions & style builders (cn)
│   ├── pages/              # Code-split views loaded dynamically by the router
│   ├── store/
│   │   ├── authStore.ts    # Credentials & session state management
│   │   ├── themeStore.ts   # Dark/Light theme class bindings
│   │   └── toastStore.ts   # Notification alerts trigger queues
│   ├── types/
│   │   └── index.ts        # TypeScript typings for API models and UI states
│   ├── App.tsx             # Main routing registry with Suspense bundles
│   ├── main.tsx            # DOM root initializer & global error boundaries wrapper
│   └── vite-env.d.ts       # TypeScript global definitions for Vite environment variables
│
├── .env.example            # Environment variables configuration template
├── .gitignore              # Files and folders to exclude from git tracking
├── .eslintrc.json          # Coding style and static analysis validation rules
├── postcss.config.js       # PostCSS autoprefixer configurations
├── tailwind.config.js      # Design system variables and typography presets
├── tsconfig.json           # TypeScript compilation configurations
├── tsconfig.node.json      # Node-specific typescript configuration
├── netlify.toml            # Production deployment config for Netlify (security headers & redirects)
├── README.md               # Getting started instructions and commands
├── CONTRIBUTING.md         # Contribution and code standard guidelines
├── DEPLOYMENT.md           # Production deployment, architecture, and API integration guide
├── PROJECT_STRUCTURE.md    # Current file structures & monorepo target guide (this file)
└── TODO.md                 # Development queue and roadmap tracking
```

---

## 📦 Monorepo Target Architecture

The finalized repository target is a monorepo structure separating frontend clients, backend microservices, and system-wide documentation engines:

```
CourTier/
 ├── frontend/              # <-- [Move current courtier-frontend content here]
 ├── backend/               # <-- Spring Boot API microservices
 └── docs/                  # <-- Architecture, Scrapers, and OpenAPI specifications
```

---

## 🚀 Migration Roadmap (Step-by-Step)

To merge the frontend into the monorepo without disrupting git history or breaking configurations, execute the following steps:

### Step 1: Create Monorepo Root
Initialize the directory structure in a fresh project folder:
```bash
mkdir -p CourTier/frontend CourTier/backend CourTier/docs
```

### Step 2: Merge Frontend Files with Git History
Using a subdirectory filter is highly recommended to merge the `courtier-frontend` repository into the `frontend/` folder of the new `CourTier` repository while preserving the entire git history:

1.  In your `courtier-frontend` repository, create a new branch for migration:
    ```bash
    git checkout -b feature/prep-monorepo
    ```
2.  Filter the files into a subdirectory `frontend`:
    ```bash
    git filter-repo --to-subdirectory-filter frontend
    ```
    *(Note: This command requires the `git-filter-repo` tool, which is the modern standard replacing `git filter-branch`).*
3.  In the new master `CourTier` repository, add `courtier-frontend` as a remote, fetch it, and merge:
    ```bash
    git remote add temp-frontend /path/to/courtier-frontend
    git fetch temp-frontend
    git merge temp-frontend/feature/prep-monorepo --allow-unrelated-histories
    git remote remove temp-frontend
    ```

### Step 3: Configure Root Workspace Configurations
Initialize an npm Workspace (or Yarn/pnpm Workspaces) in the root of `CourTier/` to orchestrate builds from the parent level. Create a root `package.json`:
```json
{
  "name": "courtier-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend"
  ],
  "scripts": {
    "frontend:dev": "npm run dev -w frontend",
    "frontend:build": "npm run build -w frontend",
    "frontend:lint": "npm run lint -w frontend"
  }
}
```

### Step 4: Adjust Deployment Paths
*   **Netlify Deployment**: Update settings in your Netlify site UI:
    *   **Base Directory**: Change from `/` to `frontend`
    *   **Build Command**: Change to `npm run build`
    *   **Publish Directory**: Change to `frontend/dist`
*   **Path Resolution**: All internal imports within the frontend code use relative paths or `@/` aliases relative to `src/` (configured in `vite.config.ts` and `tsconfig.json`). Thus, moving files into `frontend/` does not break any TypeScript configurations or asset resolutions.
