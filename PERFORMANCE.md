# Performance Optimizations

This document outlines the performance optimizations implemented in the KGF Gold Marketplace Platform.

## Code Splitting & Lazy Loading

### Route-Based Code Splitting
- All page components are lazy-loaded using `React.lazy()` and `Suspense`
- This reduces initial bundle size and improves Time to Interactive (TTI)
- Components are loaded on-demand when routes are accessed

**Optimized Components:**
- HomePage
- ProductsPage
- AuctionsPage
- LoginPage / RegisterPage
- All Dashboard components (Customer, Seller, Pawnshop, Investor, Admin)
- PricePredictorPage
- ARTryOnModal
- ChatModal

### Bundle Optimization
- Manual chunking strategy in Vite config:
  - `react-vendor`: React core libraries
  - `plotly`: Charting libraries (only loaded for price predictor)
  - `mui`: Material UI components
  - `redux`: State management
  - `router`: Routing library
  - `icons`: Icon libraries
  - `radix-ui`: UI primitives
  - `dashboards`: Dashboard components (lazy-loaded)
  - `price-predictor`: Price prediction features (lazy-loaded)

## React Optimizations

### Memoization
- **React.memo**: Applied to Header component to prevent unnecessary re-renders
- **useMemo**: Used for expensive computations:
  - Gold price calculations
  - Navigation items
  - Role-based dashboard paths
  - Chart data transformations
- **useCallback**: Used for event handlers to maintain referential equality:
  - Navigation functions
  - Modal open/close handlers
  - Theme toggle
  - Language switching

### Context Optimization
- AppContext value is memoized to prevent unnecessary re-renders
- All context methods are wrapped in `useCallback`
- Reduces re-renders of components consuming the context

## Error Handling

### Error Boundaries
- Global error boundary at App level
- Route-level error boundary in Router
- Graceful error fallback UI
- Development mode shows detailed error information

## Loading States

### Suspense Fallbacks
- PageLoader component for route transitions
- Prevents layout shift during code splitting
- Improves perceived performance

## Build Optimizations

### Production Build
- **Minification**: Terser with aggressive settings
- **Tree Shaking**: Dead code elimination
- **Console Removal**: All console statements removed in production
- **CSS Code Splitting**: Separate CSS chunks for better caching
- **Asset Optimization**: Hashed filenames for cache busting

### Bundle Analysis
Run `npm run build:analyze` to visualize bundle composition and identify optimization opportunities.

## Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoring
- Use Chrome DevTools Lighthouse for performance audits
- Monitor bundle sizes with `npm run build:analyze`
- Check Network tab for lazy-loaded chunks

## Best Practices

### Component Optimization
1. Use `React.memo` for components that receive stable props
2. Memoize expensive calculations with `useMemo`
3. Wrap event handlers in `useCallback` when passing to child components
4. Avoid inline object/array creation in render methods

### Data Fetching
- RTK Query with polling intervals optimized for each use case
- Gold price: 10s polling
- Exchange rates: 30s polling
- Caching reduces unnecessary API calls

### Image Optimization
- Lazy loading for images below the fold
- ImageWithFallback component for graceful degradation
- Consider WebP format for better compression

## Future Optimizations

### Potential Improvements
1. **Service Worker**: Implement for offline support and caching
2. **Image CDN**: Use CDN for product images
3. **Virtual Scrolling**: For large product lists
4. **Prefetching**: Prefetch likely next routes
5. **Web Workers**: Move heavy computations off main thread
6. **Streaming SSR**: If migrating to Next.js or Remix

## Development Tips

1. **Profile Performance**: Use React DevTools Profiler
2. **Monitor Re-renders**: Check why components re-render
3. **Bundle Size**: Keep an eye on bundle size growth
4. **Lazy Load**: Always lazy load heavy components
5. **Memoize**: Memoize expensive operations and stable callbacks

