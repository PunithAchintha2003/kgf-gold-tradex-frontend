# KGF Gold TradeX - Unified Gold Marketplace

A modern, full-featured gold trading platform built with React, TypeScript, and Vite.

## 🚀 Features

- **Gold Trading**: Real-time gold price tracking and trading
- **Digital Investment**: Digital gold investment platform
- **Auctions**: Live auction system for gold products
- **AR Try-On**: Augmented reality jewelry try-on experience
- **Price Predictor**: AI-powered gold price prediction
- **Multi-Role Dashboard**: Separate dashboards for buyers, sellers, pawnshops, investors, and admins
- **Internationalization**: Support for English and Sinhala
- **Dark Mode**: Full dark mode support

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router DOM
- **Charts**: Plotly.js, Recharts
- **Testing**: Vitest + React Testing Library

## 📋 Prerequisites

- Node.js 20+ 
- npm 9+ or yarn/pnpm

## 🏃 Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
VITE_API_BASE_URL=https://kgf-gold-price-predictor.onrender.com
VITE_APP_ENV=development
VITE_APP_NAME=KGF Gold TradeX
VITE_APP_VERSION=0.1.0
```

### Development

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Building

```bash
# Production build
npm run build

# Production build with analysis
npm run build:analyze

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:ci

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── dashboards/     # Dashboard components
│   ├── price-predictor/# Price predictor components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── store/              # Redux store configuration
│   ├── api/           # RTK Query API definitions
│   └── slices/        # Redux slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

## 🔧 Configuration

### TypeScript

The project uses strict TypeScript configuration. See `tsconfig.json` for details.

### ESLint

ESLint is configured with industry-standard rules. See `eslint.config.js` for details.

### Vite

Vite configuration includes:
- Code splitting optimization
- Tree shaking
- Asset optimization
- Source map generation (development only)

## 🧪 Testing

Tests are written using Vitest and React Testing Library. Test files should be named `*.test.ts` or `*.test.tsx`.

## 🚢 CI/CD

GitHub Actions workflow is configured for:
- Linting and type checking
- Running tests
- Building the application
- Security audits

## 📝 Code Style

The project uses Prettier for code formatting. Run `npm run lint:fix` to auto-fix formatting issues.

## 🔒 Security

- Environment variables for sensitive data
- Security headers in HTML
- Content Security Policy (CSP) ready
- Input validation and sanitization

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

Private - All rights reserved

## 👥 Contributing

This is a private project. Please follow the coding standards and submit PRs for review.

## 🐛 Reporting Issues

Please report issues through the project's issue tracker.

## 📞 Support

For support, please contact the development team.
