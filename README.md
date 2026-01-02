# KGF Gold TradeX

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-purple?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

**A modern, full-featured gold trading platform built with React, TypeScript, and Vite**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Building for Production](#-building-for-production)
- [Deployment](#-deployment)
- [Code Style](#-code-style)
- [Security](#-security)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## 🎯 Overview

KGF Gold TradeX is a comprehensive gold marketplace platform that enables users to trade, invest, and manage gold assets. The platform features real-time price tracking, AI-powered price predictions, live auctions, and multi-role dashboards for different user types.

The frontend is built as a modern Single Page Application (SPA) that communicates with a Python-based ML backend for price predictions and data processing. The application supports multiple user roles (buyers, sellers, pawnshops, investors, and administrators) with role-specific dashboards and features.

### Key Highlights

- 🚀 **Modern Stack**: Built with React 18, TypeScript 5.8, and Vite 7
- ⚡ **Performance**: Optimized with code splitting, lazy loading, and bundle optimization
- 🎨 **UI/UX**: Beautiful, responsive design with dark mode support
- 🔒 **Secure**: Industry-standard security practices and error handling
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🌍 **i18n Ready**: Support for multiple languages (English, Sinhala)

## ✨ Features

### Core Features

- **🏦 Gold Trading** - Real-time gold price tracking and trading
- **💎 Digital Investment** - Digital gold investment platform with portfolio management
- **🔨 Live Auctions** - Real-time auction system for gold products
- **👓 AR Try-On** - Augmented reality jewelry try-on experience
- **📊 Price Predictor** - AI-powered gold price prediction with accuracy visualization and historical data
- **📈 Analytics Dashboard** - Comprehensive analytics and reporting
- **💬 Chat Support** - Integrated chat modal for customer support
- **🔐 Authentication** - Secure login and registration system

### User Management

- **👥 Multi-Role Dashboards** - Separate dashboards for:
  - 🛒 Buyers/Customers - Order management, wishlist, auctions
  - 🏪 Sellers - Product management, sales analytics
  - 🏦 Pawnshops - Auction management, inventory
  - 💼 Investors - Portfolio tracking, investment analytics
  - 👨‍💼 Administrators - System management, user oversight

### User Experience

- **🌍 Internationalization** - Support for English and Sinhala (extensible)
- **🌙 Dark Mode** - Full dark mode support with theme persistence
- **📱 Responsive Design** - Mobile-first, fully responsive UI
- **⚡ Performance Optimized** - Code splitting, lazy loading, and bundle optimization
- **♿ Accessibility** - WCAG compliant components

## 🛠️ Tech Stack

### Core Framework

| Technology                                    | Version | Purpose                 |
| --------------------------------------------- | ------- | ----------------------- |
| [React](https://react.dev/)                   | 18.3    | UI Framework            |
| [TypeScript](https://www.typescriptlang.org/) | 5.8     | Type Safety             |
| [Vite](https://vitejs.dev/)                   | 7.1     | Build Tool & Dev Server |

### State Management & Data Fetching

- **[Redux Toolkit](https://redux-toolkit.js.org/)** v2.9 - State management
- **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Data fetching and caching
- **[Redux Persist](https://github.com/rt2zz/redux-persist)** v6.0 - State persistence
- **[React Hook Form](https://react-hook-form.com/)** - Form state management

### Routing

- **[React Router](https://reactrouter.com/)** v7.9 - Client-side routing with lazy loading

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** 4.1 - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Material-UI (MUI)](https://mui.com/)** - Additional UI components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[React Icons](https://react-icons.github.io/react-icons/)** - Additional icon sets
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Data Visualization

- **[Plotly.js](https://plotly.com/javascript/)** - Advanced charting for price predictions
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Lightweight Charts](https://www.tradingview.com/lightweight-charts/)** - High-performance financial charts

### Testing

- **[Vitest](https://vitest.dev/)** 2.1 - Unit testing framework
- **[React Testing Library](https://testing-library.com/react/)** - Component testing
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM environment for tests

### Code Quality

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **TypeScript Strict Mode** - Enhanced type checking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** (for version control)

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
- **nvm** (Node Version Manager) - Recommended for managing Node.js versions

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kgf-gold-tradex-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Create .env file (if .env.example exists, copy it)
cp .env.example .env  # or create manually
```

Edit `.env` with your configuration:

```env
# API Configuration
# In development, leave empty to use Vite proxy (bypasses CORS)
# In production, use the full API URL
VITE_API_BASE_URL=

# Application Configuration
VITE_APP_ENV=development
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_LOGGING=true

# Build Configuration
VITE_BUILD_SOURCEMAP=false

# Demo Configuration (optional)
VITE_DEMO_PASSWORD=
```

**Note**: In development mode, leaving `VITE_API_BASE_URL` empty will use relative URLs and leverage Vite's proxy configuration (see `vite.config.ts`), which helps bypass CORS issues. In production, you should set the full API URL.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4000`

### 5. Verify Installation

- Open `http://localhost:4000` in your browser
- You should see the KGF Gold TradeX homepage
- Check the browser console for any errors

## 📁 Project Structure

```
kgf-gold-tradex-frontend/
├── public/                 # Static public assets
├── src/
│   ├── core/              # Core infrastructure
│   │   ├── api/           # Base API configuration
│   │   ├── config/        # App configuration
│   │   ├── constants/     # Application constants
│   │   ├── hooks/         # Core hooks
│   │   ├── types/         # Core types
│   │   └── utils/         # Core utilities
│   ├── components/        # Feature components
│   │   ├── dashboards/    # Dashboard components
│   │   ├── price-predictor/ # Price predictor components
│   │   └── ui/            # Base UI components
│   ├── pages/             # Page components
│   ├── routes/            # Routing configuration
│   ├── store/             # Redux store
│   │   ├── api/           # RTK Query APIs
│   │   ├── slices/        # Redux slices
│   │   └── selectors/     # Redux selectors
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── layouts/           # Layout components
│   ├── shared/            # Shared components & utilities
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   └── utils/              # Utility functions
├── .editorconfig          # Editor configuration
├── .eslintrc.js           # ESLint configuration
├── .gitignore             # Git ignore rules
├── .nvmrc                 # Node version
├── .prettierrc            # Prettier configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── vercel.json            # Vercel deployment configuration
└── vitest.config.ts       # Vitest configuration
```

## 🗺️ Application Routes

The application uses React Router for client-side routing with lazy-loaded components:

### Public Routes

- `/` - Home page
- `/products` - Gold products catalog with AR try-on
- `/auctions` - Live auctions page
- `/price-predictor` - AI-powered price prediction tool
- `/login` - User login
- `/register` - User registration

### Protected Dashboard Routes

All dashboard routes require authentication and specific user roles:

- `/dashboard/customer` - Customer/Buyer dashboard (requires `buyer` role)
- `/dashboard/seller` - Seller dashboard (requires `seller` role)
- `/dashboard/pawnshop` - Pawnshop dashboard (requires `pawnshop` role)
- `/dashboard/investor` - Investor dashboard (requires `investor` role)
- `/dashboard/admin` - Admin dashboard (requires `admin` role)

### Route Configuration

Routes are centrally configured in `src/core/config/routes.config.ts` with metadata for authentication and role requirements.

## 📜 Available Scripts

### Development

```bash
npm run dev              # Start development server (port 4000)
npm run preview          # Preview production build locally
```

### Building

```bash
npm run build            # Production build
npm run build:analyze    # Production build with bundle analysis
npm run build:prod       # Production build with NODE_ENV=production
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking
npm run validate         # Run all checks (type-check, lint, format)
```

### Testing

```bash
npm test                 # Run tests in watch mode
npm run test:ci          # Run tests once (CI mode)
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Run tests with Vitest UI
npm run test:watch       # Run tests in watch mode
```

### Maintenance

```bash
npm run clean            # Clean build artifacts and cache
```

## ⚙️ Configuration

### TypeScript

The project uses strict TypeScript configuration:

- **Strict mode**: All strict checks enabled
- **Path aliases**: `@/` maps to `src/`
- **Module resolution**: Bundler mode for Vite

See `tsconfig.json` for full configuration.

### ESLint

ESLint is configured with:

- TypeScript ESLint rules
- React hooks rules
- Code quality rules

See `eslint.config.js` for full configuration.

### Vite

Vite configuration includes:

- Code splitting (route-based and vendor-based)
- Tree shaking
- Asset optimization
- Source maps (development only)
- esbuild minification (optimized for React)
- Proxy configuration for API requests in development
- Optimized dependency pre-bundling

**Development Proxy**: The Vite dev server includes a proxy configuration that routes `/api` requests to the backend API, helping bypass CORS issues during development.

See `vite.config.ts` for full configuration.

### Environment Variables

Environment variables are type-safe and validated. All Vite environment variables must be prefixed with `VITE_` to be exposed to client-side code.

#### Required Variables

| Variable            | Description  | Default                                         | Required               |
| ------------------- | ------------ | ----------------------------------------------- | ---------------------- |
| `VITE_API_BASE_URL` | API base URL | `https://kgf-gold-price-predictor.onrender.com` | ✅ Yes (in production) |

**Development Note**: In development mode, you can leave `VITE_API_BASE_URL` empty to use Vite's proxy configuration, which automatically routes `/api` requests to the backend and bypasses CORS issues.

#### Optional Variables

| Variable                    | Description               | Default           | Options                                |
| --------------------------- | ------------------------- | ----------------- | -------------------------------------- |
| `VITE_APP_ENV`              | Application environment   | `development`     | `development`, `production`, `staging` |
| `VITE_APP_NAME`             | Application name          | `KGF Gold TradeX` | Any string                             |
| `VITE_APP_VERSION`          | Application version       | `0.1.0`           | Semantic version                       |
| `VITE_ENABLE_ANALYTICS`     | Enable analytics tracking | `false`           | `true`, `false`                        |
| `VITE_ENABLE_ERROR_LOGGING` | Enable error logging      | `true`            | `true`, `false`                        |
| `VITE_BUILD_SOURCEMAP`      | Generate source maps      | `false`           | `true`, `false`                        |
| `VITE_DEMO_PASSWORD`        | Demo account password     | Empty string      | Any string                             |

#### Example `.env` File

**Development (uses Vite proxy):**
```env
# API Configuration - Leave empty to use Vite proxy in development
VITE_API_BASE_URL=

# Application Configuration
VITE_APP_ENV=development
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_LOGGING=true

# Build Configuration
VITE_BUILD_SOURCEMAP=false
```

**Production:**
```env
# API Configuration
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com

# Application Configuration
VITE_APP_ENV=production
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_LOGGING=true

# Build Configuration
VITE_BUILD_SOURCEMAP=false
```

#### Production Environment Variables (Copy-Paste Ready)

For Vercel or other deployment platforms:

```env
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com
VITE_APP_ENV=production
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_LOGGING=true
VITE_BUILD_SOURCEMAP=false
```

#### Type Definitions

See `src/utils/env.ts` for type-safe environment variable access and validation.

## 🧪 Testing

### Test Structure

Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions.

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '@/pages';

describe('HomePage', () => {
  it('renders correctly', () => {
    render(<HomePage onNavigate={() => {}} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

### Test Coverage

Run tests with coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Test Configuration

- **Framework**: Vitest
- **Environment**: jsdom
- **Coverage**: v8 provider
- **Setup**: `src/test/setup.ts`

See `vitest.config.ts` for full configuration.

## 🏗️ Building for Production

### Production Build

```bash
npm run build
```

This will:

1. Run TypeScript type checking
2. Build the application with optimizations
3. Generate production-ready assets in the `build/` directory

### Build Output

The build process generates:

- Optimized JavaScript bundles
- Minified CSS
- Optimized assets
- Source maps (if enabled)

### Build Analysis

Analyze bundle size and composition:

```bash
npm run build:analyze
```

This generates a visual bundle analysis report at `dist/stats.html`.

### Preview Production Build

```bash
npm run build
npm run preview
```

## 🚀 Deployment

### Backend Integration

This frontend application connects to a Python-based ML backend API. The backend is located in the `kgf-gold-price-predictor-ml-backend/` directory and provides:

- **Gold Price Prediction**: ML-powered price forecasting with accuracy metrics
- **User Authentication**: Login, registration, and session management
- **Product Management**: Gold product catalog and inventory
- **Auction System**: Real-time auction data and bidding
- **Analytics**: User analytics and reporting endpoints
- **News Integration**: Gold market news and updates

**Backend API Base URL**: `https://kgf-gold-price-predictor.onrender.com`

**Development Proxy**: In development mode, the Vite dev server proxies `/api/*` requests to the backend, allowing you to use relative URLs and bypass CORS issues.

**API Communication**: The frontend uses RTK Query for API calls, providing automatic caching, request deduplication, and optimistic updates.

For backend setup and documentation, see `kgf-gold-price-predictor-ml-backend/README.md`.

### Build for Production

```bash
npm run build:prod
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Bundle size optimized
- [ ] Error tracking configured
- [ ] Analytics configured (if needed)

### Deployment Platforms

The application can be deployed to:

- **Vercel** - Recommended for Vite apps (auto-detects Vite framework)
- **Netlify** - Easy deployment with CI/CD
- **AWS S3 + CloudFront** - Static hosting
- **Docker** - Containerized deployment

### Deploying to Vercel

Vercel automatically detects Vite projects and configures the build settings. The project includes a `vercel.json` configuration file that handles routing and caching.

#### Vercel Configuration Settings

When setting up your Vercel project, use these settings:

| Setting              | Value           | Description                                             |
| -------------------- | --------------- | ------------------------------------------------------- |
| **Root Directory**   | `./`            | Project root (default)                                  |
| **Framework Preset** | `Vite`          | Auto-detected, but can be set manually                  |
| **Build Command**    | `npm run build` | Production build command                                |
| **Output Directory** | `build`         | Build output directory (configured in `vite.config.ts`) |
| **Install Command**  | `npm install`   | Default npm install                                     |

**Note**: The `vercel.json` file is already configured with:
- SPA routing (all routes redirect to `index.html`)
- Cache headers for assets (long-term caching)
- No-cache headers for `index.html` (ensures fresh app loads)

#### Setup Steps

1. **Connect Repository to Vercel**:

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub/GitLab/Bitbucket repository
   - Vercel will auto-detect Vite framework

2. **Configure Build Settings** (if auto-detection fails):

   - **Root Directory**: `./` (default)
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Configure Environment Variables**:

   - Go to **Settings > Environment Variables** in your Vercel project
   - Add all required environment variables (see below)
   - Select environments (Production, Preview, Development) for each variable

4. **Deploy**:
   - Push to your main branch to trigger automatic deployment
   - Or click "Deploy" in the Vercel dashboard

#### Environment Variables for Vercel

Copy and paste these environment variables into Vercel's Environment Variables section:

**Required Variables:**

```env
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com
VITE_APP_ENV=production
```

**Recommended Production Variables:**

```env
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com
VITE_APP_ENV=production
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_LOGGING=true
VITE_BUILD_SOURCEMAP=false
```

**Note**:

- All Vite environment variables must be prefixed with `VITE_` to be exposed to client-side code
- Variables are available at build time and will be embedded in the bundle
- Set variables for Production, Preview, and Development environments as needed

#### Deploying with GitHub Actions

This project includes a GitHub Actions workflow for automatic deployment to Vercel.

##### Required GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name         | Description            | Where to Get It                                                                    |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel API token       | [Vercel Settings > Tokens](https://vercel.com/account/tokens) - Create a new token |
| `VERCEL_ORG_ID`     | Vercel Organization ID | Vercel Project Settings > General - Copy Organization ID                           |
| `VERCEL_PROJECT_ID` | Vercel Project ID      | Vercel Project Settings > General - Copy Project ID                                |

##### Optional GitHub Secrets (for build-time environment variables)

You can also add these secrets if you want to override defaults during build:

| Secret Name                 | Description             | Default                                         |
| --------------------------- | ----------------------- | ----------------------------------------------- |
| `VITE_API_BASE_URL`         | API base URL            | `https://kgf-gold-price-predictor.onrender.com` |
| `VITE_APP_ENV`              | Application environment | `production`                                    |
| `VITE_APP_NAME`             | Application name        | `KGF Gold TradeX`                               |
| `VITE_APP_VERSION`          | Application version     | `0.1.0`                                         |
| `VITE_ENABLE_ANALYTICS`     | Enable analytics        | `true`                                          |
| `VITE_ENABLE_ERROR_LOGGING` | Enable error logging    | `true`                                          |
| `VITE_BUILD_SOURCEMAP`      | Generate source maps    | `false`                                         |

**Note**: These build-time variables are optional. The workflow will use defaults if not provided. For runtime environment variables, configure them in Vercel's dashboard instead.

##### How It Works

The GitHub Actions workflow (`.github/workflows/deploy-vercel.yml`) will:

- ✅ Run on push to `main`/`master` branches (production deployment)
- ✅ Run on pull requests (preview deployment)
- ✅ Run type checking
- ✅ Run linting (non-blocking)
- ✅ Build the project
- ✅ Deploy to Vercel automatically

##### Getting Your Vercel Credentials

1. **VERCEL_TOKEN**:

   - Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Click **Create Token**
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token (you'll only see it once!)

2. **VERCEL_ORG_ID**:

   - Go to your Vercel project dashboard
   - Navigate to **Settings > General**
   - Find **Organization ID** and copy it

3. **VERCEL_PROJECT_ID**:
   - In the same **Settings > General** page
   - Find **Project ID** and copy it

##### Workflow Features

- **Automatic Production Deployments**: Pushes to `main`/`master` trigger production deployments
- **Preview Deployments**: Pull requests get preview deployments
- **Type Checking**: Ensures code quality before deployment
- **Linting**: Checks code style (non-blocking)
- **Build Optimization**: Uses Vercel's optimized build process

#### Manual Deployment with Vercel CLI

You can also deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Troubleshooting Vercel Deployment

**Build Fails with Validation Errors:**

- The `prepare` script has been removed from `package.json` to prevent blocking deployments
- Run `npm run validate` locally before pushing to catch issues early

**Environment Variables Not Working:**

- Ensure all variables are prefixed with `VITE_`
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

**Build Output Directory Issues:**

- The build outputs to `build/` directory (configured in `vite.config.ts`)
- Ensure Vercel's Output Directory is set to `build`
- The `vercel.json` file already configures this, so Vercel should auto-detect it

**CORS Issues in Production:**

- If you see CORS errors when testing production builds locally, this is expected
- The app will work correctly when deployed to Vercel or other hosting platforms
- Ensure your backend API has proper CORS headers configured for your production domain

### Environment Variables Reference

See [Configuration](#-configuration) section for detailed environment variable documentation.

## 📝 Code Style

### Formatting

The project uses Prettier for consistent code formatting:

```bash
npm run format
```

### Editor Configuration

The project includes:

- `.editorconfig` - Editor settings
- `.prettierrc` - Prettier configuration
- ESLint integration

### Import Organization

Use path aliases for cleaner imports:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { HomePage } from '@/pages';
import { convertPrice } from '@/utils/currencyConverter';

// ❌ Avoid
import { Button } from '../../../components/ui/button';
```

### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `HomePage.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `currencyConverter.ts`)
- **Types**: `camelCase.ts` or `index.ts`
- **Constants**: `camelCase.ts` or `UPPER_SNAKE_CASE.ts`
- **Hooks**: `useCamelCase.ts` (e.g., `useNavigation.ts`)

### Code Quality Standards

- Use TypeScript strict mode
- Write self-documenting code
- Follow React best practices
- Keep components small and focused
- Write tests for new features

## 🔒 Security

### Security Features

- **Environment Variables**: Sensitive data in environment variables
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Centralized error logging
- **HTTPS**: Enforced in production
- **Content Security Policy**: Ready for CSP implementation

### Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Validate and sanitize user inputs
- ✅ Keep dependencies up to date
- ✅ Use HTTPS in production
- ✅ Implement proper authentication
- ✅ Regular security audits

### Dependency Security

Check for vulnerabilities:

```bash
npm audit
```

Fix vulnerabilities:

```bash
npm audit fix
```

## ⚡ Performance

### Performance Optimizations

- **Code Splitting**: Route-based lazy loading for all major pages and dashboards
- **Lazy Loading**: Components loaded on demand using React.lazy()
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and asset optimization with inlining for small assets
- **Bundle Optimization**: Optimized chunk sizes with esbuild minification
- **Redux Persist**: State persistence reduces API calls
- **RTK Query Caching**: Automatic caching of API responses

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: Optimized for production

### Performance Monitoring

Monitor performance in production using:

- Browser DevTools
- Lighthouse
- Web Vitals

## 🌐 Browser Support

The application supports modern browsers:

| Browser | Version |
| ------- | ------- |
| Chrome  | Latest  |
| Firefox | Latest  |
| Safari  | Latest  |
| Edge    | Latest  |

### Polyfills

Modern JavaScript features are used. For older browser support, consider adding polyfills.

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: Port 4000 is already in use
# Solution: Kill the process or use a different port
lsof -ti:4000 | xargs kill -9
```

#### Module Not Found

```bash
# Error: Cannot find module
# Solution: Clear cache and reinstall
npm run clean
rm -rf node_modules
npm install
```

#### TypeScript Errors

```bash
# Error: Type errors
# Solution: Run type check
npm run type-check
```

#### Build Failures

```bash
# Error: Build fails
# Solution: Check for errors
npm run lint
npm run type-check
```

#### Vercel Deployment Errors

**Error: `npm run validate` failed during install**

- This has been fixed by removing the `prepare` script
- Run `npm run validate` locally before pushing to catch issues early

**Error: Linting errors blocking deployment**

- Fix linting issues locally: `npm run lint:fix`
- Common fixes: Remove unnecessary dependencies, fix TypeScript `any` types, remove `console.log` statements

### Getting Help

1. Check the [Issues](../../issues) page
2. Review the documentation
3. Contact the development team

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run quality checks**
   ```bash
   npm run validate
   ```
5. **Write/update tests**
6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature"
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

### Code Review Process

1. All PRs require review
2. All checks must pass (lint, type-check, tests)
3. Code must follow style guidelines
4. Tests must be included for new features

## 📄 License

This project is proprietary and confidential. All rights reserved.

**Copyright © 2024 KGF Gold TradeX. All rights reserved.**

## 📞 Support

For support and questions:

- **Email**: support@kgf-gold.com
- **Documentation**: See inline code comments
- **Issues**: [GitHub Issues](../../issues)

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Component Primitives
- [shadcn/ui](https://ui.shadcn.com/) - Component Library

---

<div align="center">

**Built with ❤️ by the KGF Development Team**

[⬆ Back to Top](#-table-of-contents)

</div>
