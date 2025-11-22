# KGF Gold Price Predictor

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-7.3.2-007FFF?logo=mui)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive gold price prediction application with real-time data visualization and AI-powered price forecasting. Built with React, TypeScript, and Material UI.

## ✨ Features

- **Real-time Price Updates**: Live gold price updates every 2 seconds
- **AI Predictions**: Machine learning-powered next-day assessments with accuracy tracking
- **Multi-currency Support**: USD (troy ounce) and LKR (Sri Lankan Rupee) with live exchange rates
- **Interactive Charts**: Plotly.js integration with zoom, pan, and hover features
- **Dark/Light Theme**: Persistent theme preferences with smooth transitions
- **Responsive Design**: Mobile-first approach optimized for all devices
- **Professional UI**: TradingView-inspired interface with Material UI components
- **State Management**: Redux Toolkit with RTK Query for efficient data caching

## 🛠️ Tech Stack

### Frontend

- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **Plotly.js** - Interactive charts
- **React Router** - Client-side routing

### Backend Integration

- **FastAPI** - REST API backend
- **Machine Learning** - Price prediction engine
- **Real-time Data** - Live market data feeds

## 📋 Prerequisites

- **Node.js**: 22.x (required for Vercel deployment)
- **npm**: 9.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/kgf-gold-price-predictor-frontend.git
   cd kgf-gold-price-predictor-frontend
   ```

2. **Install dependencies**

   ```bash
   cd react-frontend
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
kgf-gold-price-predictor-frontend/
├── react-frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── AccuracyStats.tsx
│   │   │   ├── PredictionExplanation.tsx
│   │   │   ├── CurrencyDropdown.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── store/               # Redux store & API slices
│   │   │   ├── index.ts
│   │   │   ├── api/
│   │   │   └── slices/
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useTheme.ts
│   │   │   └── useWebSocket.ts
│   │   ├── theme/               # Theme configuration
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── dist/                    # Production build
│   └── package.json
├── vercel.json                  # Vercel deployment configuration
├── .github/
│   └── workflows/
│       └── deploy-vercel.yml    # GitHub Actions workflow
└── README.md
```

## 🌐 Deployment

### Deploy to Vercel

This project is configured for automated deployment on Vercel using GitHub Actions:

1. **Set up Vercel project:**
   - Create a project in [Vercel](https://vercel.com)
   - Get your Vercel token, Organization ID, and Project ID

2. **Add GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

3. **Automatic Deployment:**
   - Push to `main` or `master` branch → Production deployment
   - Create a pull request → Preview deployment

**Deployment Configuration** (`vercel.json`):
- Build command: `cd react-frontend && npm install && npm run build`
- Output directory: `react-frontend/dist`
- Framework: Vite

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## 📊 API Integration

The frontend connects to a FastAPI backend with the following endpoints:

- `GET /xauusd` - Historical data with predictions
- `GET /xauusd/realtime` - Real-time current price
- `GET /xauusd/explanation` - Prediction analysis
- `GET /exchange-rate/{from}/{to}` - Currency exchange rates

## 🎨 Key Components

### Dashboard

Main application interface displaying live prices, charts, and predictions.

### Chart

Interactive Plotly.js chart with historical data visualization.

### AccuracyStats

Model performance metrics and prediction accuracy tracking.

### PredictionExplanation

Detailed breakdown of AI prediction factors and methodology.

### CurrencyDropdown

Multi-currency support with real-time conversion.

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution

- UI/UX improvements
- Additional chart types and visualizations
- Performance optimizations
- Accessibility enhancements
- Test coverage
- Documentation improvements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. The AI predictions and market data should not be considered as financial advice or used for actual trading decisions. Always consult with qualified financial professionals before making investment decisions.

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ using React, TypeScript, and Material UI**
