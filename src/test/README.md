# Test Setup

## Note on Type Errors

If you see TypeScript errors in `setup.ts` about missing modules (`vitest`, `@testing-library/react`, etc.), this is expected until you install the dependencies.

Run the following to install all dependencies including test dependencies:

```bash
npm install
```

After installation, all type errors should be resolved.

## Test Configuration

- **Test Framework**: Vitest
- **Testing Library**: React Testing Library
- **Test Environment**: jsdom
- **Coverage**: v8 provider

## Running Tests

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

