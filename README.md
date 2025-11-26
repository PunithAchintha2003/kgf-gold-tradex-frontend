# KGF Gold TradeX

> A modern, full-featured gold trading platform built with React, TypeScript, and Vite.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Code Style](#code-style)
- [Security](#security)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

KGF Gold TradeX is a comprehensive gold marketplace platform that enables users to trade, invest, and manage gold assets. The platform features real-time price tracking, AI-powered price predictions, live auctions, and multi-role dashboards for different user types.

## ✨ Features

- **🏦 Gold Trading** - Real-time gold price tracking and trading
- **💎 Digital Investment** - Digital gold investment platform
- **🔨 Auctions** - Live auction system for gold products
- **👓 AR Try-On** - Augmented reality jewelry try-on experience
- **📊 Price Predictor** - AI-powered gold price prediction with accuracy visualization
- **👥 Multi-Role Dashboards** - Separate dashboards for:
  - Buyers/Customers
  - Sellers
  - Pawnshops
  - Investors
  - Administrators
- **🌍 Internationalization** - Support for English and Sinhala
- **🌙 Dark Mode** - Full dark mode support with theme persistence
- **📱 Responsive Design** - Mobile-first, fully responsive UI
- **⚡ Performance Optimized** - Code splitting, lazy loading, and bundle optimization

## 🛠️ Tech Stack

### Core
- **Framework**: [React](https://react.dev/) 18.3 with [TypeScript](https://www.typescriptlang.org/) 5.8
- **Build Tool**: [Vite](https://vitejs.dev/) 7.1
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Routing**: Custom router implementation

### UI & Styling
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) 4.1
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

### Data Visualization
- **Charts**: [Plotly.js](https://plotly.com/javascript/) + [Recharts](https://recharts.org/)

### Testing
- **Test Framework**: [Vitest](https://vitest.dev/) 2.1
- **Testing Library**: [React Testing Library](https://testing-library.com/react/)
- **Test Environment**: jsdom

### Code Quality
- **Linting**: [ESLint](https://eslint.org/) with TypeScript support
- **Formatting**: [Prettier](https://prettier.io/)
- **Type Checking**: TypeScript strict mode

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)
- **Git** (for version control)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kgf-gold-tradex-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Setup

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   
   Edit `.env` with your configuration:
   ```env
   # API Configuration
   VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com
   
   # Application Configuration
   VITE_APP_ENV=development
   VITE_APP_NAME=KGF Gold TradeX
   VITE_APP_VERSION=0.1.0
   
   # Optional: Error Logging
   VITE_ENABLE_ERROR_LOGGING=false
   
   # Optional: Demo Password
   VITE_DEMO_PASSWORD=your-demo-password
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── app/                    # App-level configuration
├── assets/                 # Static assets (images, fonts, etc.)
├── components/             # Feature-specific components
│   ├── dashboards/        # Dashboard feature components
│   │   └── components/    # Dashboard sub-components
│   ├── price-predictor/   # Price predictor feature components
│   └── ui/                # Base UI components (shadcn/ui)
├── constants/             # Application constants
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components (Header, Footer, etc.)
├── lib/                   # Library configurations and utilities
├── pages/                 # Page-level components
├── routes/                # Routing configuration
├── shared/                # Shared components and utilities
│   ├── components/        # Reusable shared components
│   ├── hooks/            # Shared hooks
│   └── utils/            # Shared utilities
├── store/                 # Redux store configuration
│   ├── api/              # RTK Query API definitions
│   └── slices/           # Redux slices
├── styles/                # Global styles
├── test/                  # Test setup and utilities
├── theme/                 # Theme configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

For detailed structure documentation, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## 📜 Available Scripts

### Development
```bash
npm run dev              # Start development server
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
npm run type-check       # Run TypeScript type checking
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:ci          # Run tests once (CI mode)
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Run tests with Vitest UI
```

### Maintenance
```bash
npm run clean            # Clean build artifacts and cache
```

## ⚙️ Configuration

### TypeScript

The project uses strict TypeScript configuration. Key settings:

- **Strict mode**: Enabled with all strict checks
- **Path aliases**: Configured for cleaner imports (`@/components`, `@/utils`, etc.)
- **Module resolution**: Bundler mode for Vite compatibility

See `tsconfig.json` for full configuration.

### ESLint

ESLint is configured with industry-standard rules:

- TypeScript ESLint rules
- React hooks rules
- Code quality rules (no console.log, prefer const, etc.)

See `eslint.config.js` for full configuration.

### Vite

Vite configuration includes:

- **Code splitting**: Route-based and vendor-based chunking
- **Tree shaking**: Automatic dead code elimination
- **Asset optimization**: Image and asset optimization
- **Source maps**: Generated in development only
- **Minification**: Terser with aggressive optimizations

See `vite.config.ts` for full configuration.

### Environment Variables

Environment variables are type-safe and validated. See `src/utils/env.ts` for available variables.

## 🧪 Testing

### Test Setup

Tests are configured using Vitest and React Testing Library:

- **Test files**: `*.test.ts` or `*.test.tsx`
- **Test environment**: jsdom (browser-like environment)
- **Coverage**: v8 provider

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

## 🏗️ Building for Production

### Production Build

```bash
npm run build
```

This will:
1. Run TypeScript type checking
2. Build the application with optimizations
3. Generate production-ready assets in the `build/` directory

### Build Analysis

Analyze bundle size and composition:

```bash
npm run build:analyze
```

This generates a visual bundle analysis report.

### Preview Production Build

Preview the production build locally:

```bash
npm run build
npm run preview
```

## 📝 Code Style

### Formatting

The project uses Prettier for consistent code formatting. Format code automatically:

```bash
npm run lint:fix
```

### Editor Configuration

The project includes `.editorconfig` for consistent editor settings across different IDEs.

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

## 🔒 Security

### Security Features

- **Environment Variables**: Sensitive data stored in environment variables
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.
- **Content Security Policy**: Ready for CSP implementation
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Centralized error logging (ready for Sentry/LogRocket)

### Security Best Practices

- Never commit `.env` files
- Use environment variables for API keys and secrets
- Validate and sanitize user inputs
- Keep dependencies up to date

## 🌐 Browser Support

The application supports modern browsers:

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

## 🤝 Contributing

This is a private project. When contributing:

1. Follow the coding standards
2. Write tests for new features
3. Update documentation as needed
4. Submit PRs for review
5. Ensure all checks pass (lint, type-check, tests)

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run type-check`
4. Write/update tests
5. Submit a pull request

## 📄 License

Private - All rights reserved

## 📞 Support

For support, please contact the development team.

## 📚 Additional Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed project structure
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - Optimization details
- [STRUCTURE_ANALYSIS.md](./STRUCTURE_ANALYSIS.md) - Structure analysis

---

**Built with ❤️ by the KGF Development Team**
