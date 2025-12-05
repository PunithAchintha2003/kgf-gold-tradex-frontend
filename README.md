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
- **📊 Price Predictor** - AI-powered gold price prediction with accuracy visualization
- **📈 Analytics Dashboard** - Comprehensive analytics and reporting

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

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18.3 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Type Safety |
| [Vite](https://vitejs.dev/) | 7.1 | Build Tool & Dev Server |

### State Management & Data Fetching

- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Data fetching and caching
- **[Redux Persist](https://github.com/rt2zz/redux-persist)** - State persistence

### Routing

- **[React Router](https://reactrouter.com/)** - Client-side routing

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** 4.1 - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Data Visualization

- **[Plotly.js](https://plotly.com/javascript/)** - Advanced charting
- **[Recharts](https://recharts.org/)** - Composable charting library

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
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com

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
└── vitest.config.ts       # Vitest configuration
```

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
- Terser minification

See `vite.config.ts` for full configuration.

### Environment Variables

Environment variables are type-safe and validated. Available variables:

- `VITE_API_BASE_URL` - API base URL (required)
- `VITE_APP_ENV` - Application environment
- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_ANALYTICS` - Enable analytics
- `VITE_ENABLE_ERROR_LOGGING` - Enable error logging

See `src/utils/env.ts` for type definitions.

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

- **Vercel** - Recommended for Vite apps (configured with GitHub Actions)
- **Netlify** - Easy deployment with CI/CD
- **AWS S3 + CloudFront** - Static hosting
- **Docker** - Containerized deployment

### Deploying to Vercel with GitHub Actions

This project is configured for automatic deployment to Vercel via GitHub Actions.

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you haven't already
2. **Vercel Project**: Create a new project in Vercel dashboard
3. **GitHub Repository**: Ensure your code is pushed to GitHub

#### Setup Steps

1. **Get Vercel Credentials**:
   - Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token and copy it
   - In your Vercel project dashboard, go to Settings > General
   - Copy your **Organization ID** and **Project ID**
   - **Root Directory**: Since this project is at the repository root, leave the root directory as `.` (default) in Vercel project settings. If your project is in a subdirectory, set it accordingly.

2. **Configure GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to **Settings > Secrets and variables > Actions**
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

3. **Configure Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings > Environment Variables**
   - Add all required environment variables (see below)

4. **Deploy**:
   - Push to `main` or `master` branch to trigger automatic deployment
   - Or manually trigger the workflow from **Actions** tab in GitHub

#### Workflow Features

- ✅ Automatic deployment on push to main/master branches
- ✅ Type checking before deployment
- ✅ Linting (non-blocking)
- ✅ Production build with optimizations
- ✅ Preview deployments for pull requests

#### Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables in Production

Ensure all required environment variables are set in your deployment platform:

**Required Variables:**
```env
VITE_API_BASE_URL=https://your-api-url.com
VITE_APP_ENV=production
```

**Optional Variables:**
```env
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_LOGGING=true
VITE_BUILD_SOURCEMAP=false
```

**Note**: In Vercel, add these in the project settings under Environment Variables. They will be automatically available during build time.

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

- **Code Splitting**: Route-based and vendor-based
- **Lazy Loading**: Components loaded on demand
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and asset optimization
- **Bundle Optimization**: Optimized chunk sizes

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
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |

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
