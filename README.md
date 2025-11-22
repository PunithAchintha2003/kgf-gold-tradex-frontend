# KGF Gold Marketplace Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-7.3.2-007FFF?logo=mui)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive gold marketplace platform featuring product listings, live auctions, AI-powered price predictions, AR try-on functionality, and role-based dashboards for customers, sellers, pawnshops, investors, and administrators.

## ✨ Features

### Marketplace
- **Product Catalog**: Browse verified gold products with detailed information
- **AR Try-On**: Virtual try-on experience for jewelry using AR technology
- **Product Search & Filtering**: Advanced search and filter capabilities
- **Wishlist Management**: Save favorite products for later

### Auctions
- **Live Auctions**: Real-time auction participation from verified pawnshops
- **Bidding System**: Interactive bidding interface with live updates
- **Auction History**: Track past and upcoming auctions

### Price Predictor
- **Real-time Price Updates**: Live gold price updates every 2 seconds
- **AI Predictions**: Machine learning-powered next-day price assessments with accuracy tracking
- **Multi-currency Support**: USD (troy ounce) and LKR (Sri Lankan Rupee) with live exchange rates
- **Interactive Charts**: Plotly.js integration with zoom, pan, and hover features
- **Prediction History**: Track historical predictions and accuracy

### User Dashboards
- **Customer Dashboard**: Order management, wishlist, and purchase history
- **Seller Dashboard**: Product management, sales analytics, and inventory
- **Pawnshop Dashboard**: Auction management and inventory tracking
- **Investor Dashboard**: Digital gold investments and portfolio tracking
- **Admin Dashboard**: Platform management, user administration, and analytics

### Additional Features
- **Authentication System**: Secure login and registration
- **Chat Support**: Real-time chat functionality
- **Dark/Light Theme**: Persistent theme preferences with smooth transitions
- **Responsive Design**: Mobile-first approach optimized for all devices
- **State Management**: Redux Toolkit with RTK Query for efficient data caching

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 7.1** - Build tool and dev server
- **Material UI 7.3** - Component library
- **Tailwind CSS 4.1** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Redux Toolkit** - State management
- **React Router 7.9** - Client-side routing
- **Plotly.js** - Interactive charts
- **Recharts** - Additional charting capabilities
- **React Hook Form** - Form management
- **Lucide React** - Icon library

### Build & Development
- **Vite** - Fast build tool and HMR
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Terser** - Code minification

## 📋 Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 9.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kgf-gold-tradex-frontend.git
   cd kgf-gold-tradex-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   The application will automatically open at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Build with bundle analysis
npm run build:analyze

# Production build with optimizations
npm run build:prod

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
kgf-gold-tradex-frontend/
├── src/
│   ├── components/              # React components
│   │   ├── dashboards/          # Role-based dashboards
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── SellerDashboard.tsx
│   │   │   ├── PawnshopDashboard.tsx
│   │   │   ├── InvestorDashboard.tsx
│   │   │   └── components/      # Shared dashboard components
│   │   ├── price-predictor/     # Price prediction features
│   │   │   ├── PricePredictorPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chart.tsx
│   │   │   └── ...
│   │   ├── ui/                  # Reusable UI components (shadcn/ui)
│   │   ├── Header.tsx
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── AuctionsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── Router.tsx
│   │   ├── ARTryOnModal.tsx
│   │   └── ChatModal.tsx
│   ├── contexts/                # React contexts
│   │   └── AppContext.tsx
│   ├── store/                   # Redux store
│   │   ├── index.ts
│   │   ├── api/                 # RTK Query APIs
│   │   │   └── goldApi.ts
│   │   └── slices/              # Redux slices
│   │       └── themeSlice.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useTheme.ts
│   │   └── useWebSocket.ts
│   ├── utils/                   # Utility functions
│   │   ├── currencyConverter.ts
│   │   └── dashboardUtils.ts
│   ├── theme/                   # Theme configuration
│   │   └── theme.ts
│   ├── styles/                  # Global styles
│   │   └── globals.css
│   ├── constants/               # Constants and mock data
│   │   └── mockData.ts
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Base styles
├── public/                      # Static assets
├── build/                       # Production build output
├── vite.config.ts               # Vite configuration
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run build:analyze # Build with bundle analysis
npm run build:prod   # Production build with optimizations
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors automatically
npm run type-check   # TypeScript type checking without emitting
npm run clean        # Clean build artifacts and cache
```

## 🎨 Key Components

### Router
Main routing component handling navigation and route protection based on authentication and user roles.

### Dashboards
- **CustomerDashboard**: Order management, wishlist, purchase history
- **SellerDashboard**: Product management, sales analytics
- **PawnshopDashboard**: Auction management, inventory
- **InvestorDashboard**: Digital gold portfolio, investments
- **AdminDashboard**: Platform administration, user management

### Price Predictor
- **PricePredictorPage**: Main price prediction interface
- **Chart**: Interactive Plotly.js charts with historical data
- **AccuracyStats**: Model performance metrics
- **PredictionExplanation**: AI prediction breakdown

### Marketplace
- **ProductsPage**: Product catalog with search and filters
- **AuctionsPage**: Live auction interface
- **ARTryOnModal**: AR try-on experience for jewelry
- **ChatModal**: Real-time chat support

## 🌐 API Integration

The frontend connects to backend APIs for:
- User authentication and authorization
- Product catalog and management
- Auction data and bidding
- Gold price data and predictions
- Real-time chat functionality
- Order and transaction management

## 🎯 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write reusable components
- Follow the existing component structure

### State Management
- Use Redux Toolkit for global state
- Use React Context for app-level state
- Use local state for component-specific data
- Leverage RTK Query for API calls

### Styling
- Use Tailwind CSS for utility-first styling
- Use Radix UI components for accessible primitives
- Follow Material UI design principles where applicable
- Maintain consistent spacing and typography

## 🚢 Deployment

### Build Configuration
- Build output directory: `build/`
- Development server port: `5173`
- Production optimizations: Enabled (minification, tree-shaking)
- Source maps: Disabled in production

### Environment Variables
Create a `.env` file in the root directory for environment-specific configuration:
```env
VITE_API_BASE_URL=your_api_url
VITE_WS_URL=your_websocket_url
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution
- UI/UX improvements
- Additional features and functionality
- Performance optimizations
- Accessibility enhancements
- Test coverage
- Documentation improvements
- Bug fixes

### Development Workflow
1. Create a feature branch from `main`
2. Make your changes
3. Run linting and type checking
4. Test your changes
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. The AI predictions and market data should not be considered as financial advice or used for actual trading decisions. Always consult with qualified financial professionals before making investment decisions.

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ using React, TypeScript, Vite, and Material UI**
