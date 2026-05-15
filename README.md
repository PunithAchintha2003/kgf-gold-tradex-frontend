<span id="top"></span>

# ✨ KGF Gold TradeX

<div align="center">

**A modern gold marketplace — trade, invest, auction, and predict prices with AI**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.9-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.9-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)
[![Plotly](https://img.shields.io/badge/Plotly.js-2.35-3F4F75?logo=plotly&logoColor=white)](https://plotly.com/javascript/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

[Features](#features) · [Getting started](#getting-started) · [Environment](#environment-variables) · [Deploy](#build-and-deployment)

</div>

Frontend for the KGF Gold marketplace: 🏦 trading, 💎 digital gold investment, 🔨 live auctions, 👓 AR try-on, and 📊 ML-powered price predictions. Built with ⚛️ React, 📘 TypeScript, and ⚡ Vite.

---

## 📑 Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Testing](#testing)
- [Build and deployment](#build-and-deployment)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

<span id="features"></span>

## ✨ Features

- 🏦 **Gold trading** — Spot trade UI and live price charts
- 🛍️ **Product catalog** — Browse products with cart and checkout
- 🔨 **Live auctions** — Auction listings and bidding flows
- 📊 **Price predictor** — ML-backed forecasts with charts and history
- 👓 **AR try-on** — Jewelry preview experience
- 👥 **Role-based dashboards** — Buyer, seller, pawnshop, investor, and admin views
- 🔐 **Auth** — Login, registration, and protected routes
- 🌙 **Theming** — Light/dark mode with persisted preference
- 🌍 **i18n-ready** — English and Sinhala support in the UI layer

<span id="architecture"></span>

## 🏗️ Architecture

This SPA talks to two backends in local development (via the Vite dev proxy in `vite.config.ts`):

| Traffic | Dev proxy target | Purpose |
| -------- | ----------------- | -------- |
| `/api/v1/auth`, `/api/v1/users`, `/api/v1/catalog`, `/api/v1/checkout` | `http://localhost:5001` | 🟢 Node.js commerce API (MERN) |
| `/api/*` (other paths) | `http://localhost:8001` | 🐍 Python ML / trading API |

In production, set `VITE_API_BASE_URL` for the Python API and `VITE_NODE_API_BASE_URL` for the Node API origin. See [`src/utils/env.ts`](src/utils/env.ts) for how URLs are resolved.

State is managed with **Redux Toolkit**, **RTK Query**, and **redux-persist**. Routing uses **React Router** v7 with lazy-loaded pages.

<span id="prerequisites"></span>

## 📋 Prerequisites

- 🟢 [Node.js](https://nodejs.org/) **20+** (see [`.nvmrc`](.nvmrc))
- 📦 npm **9+**
- 🔌 Running backend services for full functionality (Node on port **5001**, Python on port **8001** in local dev)

<span id="getting-started"></span>

## 🚀 Getting started

### 1️⃣ Clone and install

```bash
git clone <repository-url>
cd kgf-gold-tradex-frontend
npm install
```

### 2️⃣ Configure environment

Create a `.env` file in the project root:

```env
# Python / ML API (optional in dev — Vite proxies /api to localhost:8001)
VITE_API_BASE_URL=

# Node commerce API origin (required in production), e.g. https://your-api.example.com
VITE_NODE_API_BASE_URL=

# App
VITE_APP_ENV=development
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_LOGGING=true
VITE_BUILD_SOURCEMAP=false
```

**Development:** Leave `VITE_API_BASE_URL` empty to use relative URLs and the Vite proxy. Commerce calls use `/api/v1` via `getNodeApiV1Base()`.

**Production:** Set both `VITE_API_BASE_URL` and `VITE_NODE_API_BASE_URL`. Production builds validate these in `validateEnv()`.

### 3️⃣ Run the dev server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000). The dev server uses port **4000** with `strictPort` enabled.

<span id="environment-variables"></span>

## ⚙️ Environment variables

All client-exposed variables must use the `VITE_` prefix. Definitions live in [`src/utils/env.ts`](src/utils/env.ts) and [`src/types/env.d.ts`](src/types/env.d.ts).

| Variable | Description | Dev default | Production |
| -------- | ----------- | ----------- | ---------- |
| `VITE_API_BASE_URL` | Python / ML API base URL | Empty (proxy) | ✅ Required |
| `VITE_NODE_API_BASE_URL` | Node API origin (no `/api/v1` suffix) | `/api/v1` via proxy | ✅ Required |
| `VITE_APP_ENV` | `development` \| `production` \| `staging` | `development` | `production` |
| `VITE_APP_NAME` | Display name | `KGF Gold TradeX` | Optional |
| `VITE_APP_VERSION` | App version string | `0.1.0` | Optional |
| `VITE_ENABLE_ANALYTICS` | Analytics toggle | `false` | `true` / `false` |
| `VITE_ENABLE_ERROR_LOGGING` | Client error logging | `true` | `true` / `false` |
| `VITE_BUILD_SOURCEMAP` | Emit source maps | `false` | `false` |
| `VITE_DEMO_PASSWORD` | Demo account password | — | Optional |

> 🔒 Never commit `.env` files or secrets to version control.

<span id="scripts"></span>

## 📜 Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | ⚡ Start Vite dev server (port 4000) |
| `npm run build` | 🏗️ Typecheck and production build → `build/` |
| `npm run build:prod` | 🚀 Production build with `NODE_ENV=production` |
| `npm run build:analyze` | 📈 Build with bundle visualizer (`dist/stats.html`) |
| `npm run preview` | 👀 Serve production build locally |
| `npm run type-check` | 📘 TypeScript check without emit |
| `npm run lint` | 🔍 Run ESLint |
| `npm run lint:fix` | 🛠️ ESLint with auto-fix |
| `npm run format` | ✨ Format with Prettier |
| `npm run format:check` | ✅ Check Prettier formatting |
| `npm run validate` | 🎯 `type-check` + `lint` + `format:check` |
| `npm test` | 🧪 Vitest (watch) |
| `npm run test:ci` | 🤖 Vitest once with coverage |
| `npm run test:coverage` | 📊 Coverage report in `coverage/` |
| `npm run clean` | 🧹 Remove `build`, cache, and coverage artifacts |

<span id="project-structure"></span>

## 📁 Project structure

```
src/
├── components/       # 🧩 Feature UI (dashboards, cart, price-predictor, products)
├── contexts/         # 🔗 React context providers
├── core/             # ⚙️ API base, config, constants, shared hooks
├── hooks/            # 🪝 App-level hooks
├── layouts/          # 🖼️ Shell, header, navigation
├── pages/            # 📄 Route-level pages
├── routes/           # 🗺️ Router setup
├── services/         # 🔌 Auth and service modules
├── shared/           # 🤝 Shared components and utilities
├── store/            # 🗄️ Redux store, slices, RTK Query APIs
├── styles/           # 🎨 Global styles
├── types/            # 📘 TypeScript declarations
└── utils/            # 🛠️ Env, currency, errors, helpers
```

Path alias: `@/` → `src/` (see `tsconfig.json` and `vite.config.ts`).

<span id="routes"></span>

## 🗺️ Routes

Defined in [`src/core/config/routes.config.ts`](src/core/config/routes.config.ts).

| Path | Access |
| ---- | ------ |
| `/` | 🌐 Public |
| `/products` | 🌐 Public |
| `/auctions` | 🌐 Public |
| `/price-predictor` | 🌐 Public |
| `/trade` | 🌐 Public |
| `/login`, `/register` | 🌐 Public |
| `/purchase-history` | 🔐 Authenticated |
| `/dashboard/customer` | 👤 Role: `buyer` |
| `/dashboard/seller` | 🏪 Role: `seller` |
| `/dashboard/pawnshop` | 🏦 Role: `pawnshop` |
| `/dashboard/investor` | 💼 Role: `investor` |
| `/dashboard/admin` | 👨‍💼 Role: `admin` |

<span id="testing"></span>

## 🧪 Testing

Tests use [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react/). Colocate tests as `*.test.ts` / `*.test.tsx` next to source files.

```bash
npm test                 # watch mode
npm run test:ci          # single run + coverage (CI)
npm run test:coverage    # coverage report
```

Setup: [`src/test/setup.ts`](src/test/setup.ts) · Config: [`vitest.config.ts`](vitest.config.ts)

<span id="build-and-deployment"></span>

## 🚢 Build and deployment

### 🏗️ Production build

```bash
npm run validate   # recommended before release
npm run build
```

Output directory: **`build/`** (configured in `vite.config.ts`).

### ▲ Vercel

The repo includes [`vercel.json`](vercel.json) for SPA routing and asset caching.

1. Import the repository in [Vercel](https://vercel.com).
2. **Framework preset:** Vite  
3. **Build command:** `npm run build`  
4. **Output directory:** `build`  
5. Set production environment variables (see [Environment variables](#environment-variables)).

CI/CD: [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) deploys on push/PR to `main` or `master` when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are configured.

### 🖥️ Manual deploy (Vercel CLI)

```bash
npm i -g vercel
vercel login
vercel --prod
```

<span id="development"></span>

## 💻 Development

### 🎨 Code quality

- **ESLint** — [`eslint.config.js`](eslint.config.js)
- **Prettier** — [`.prettierrc`](.prettierrc)
- **TypeScript** — strict mode in [`tsconfig.json`](tsconfig.json)

Run before opening a PR:

```bash
npm run validate
npm run test:ci
```

### 📦 Import style

```typescript
import { Button } from '@/components/ui/button';
import { env } from '@/utils/env';
```

### 🐛 Troubleshooting

| Issue | Action |
| ----- | ------ |
| Port 4000 in use | Stop the other process or change the port in `vite.config.ts` / `package.json` |
| Module not found | `npm run clean && rm -rf node_modules && npm install` |
| API errors in dev | Ensure Node (5001) and Python (8001) backends are running |
| CORS on local preview | Expected when not using the dev proxy; use `npm run dev` or deploy with correct env vars |

<span id="contributing"></span>

## 🤝 Contributing

1. 🍴 Fork the repository and create a branch (`feature/your-change`).
2. ✏️ Make changes and add tests where appropriate.
3. ✅ Run `npm run validate` and `npm run test:ci`.
4. 🔀 Open a pull request with a clear description.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.).

<span id="license"></span>

## 📄 License

Proprietary and confidential. All rights reserved.

---

<div align="center">

**Built with ❤️ by the KGF Development Team**

[⬆ Back to top](#top)

</div>
