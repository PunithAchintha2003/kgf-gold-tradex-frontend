# TypeScript Errors Fix Guide

## Overview

After enabling strict TypeScript settings for industry standards, some existing code may have type errors. This document outlines the fixes needed.

## Fixed Files

✅ **src/components/ErrorBoundary.tsx**
- Added `override` modifiers to lifecycle methods
- Fixed error logging to handle optional `stack` property

✅ **src/utils/errorHandler.ts**
- Updated `ErrorInfo` interface to properly handle optional properties with `exactOptionalPropertyTypes`

✅ **src/main.tsx**
- Fixed error logger initialization

✅ **tsconfig.json**
- Removed `vite.config.ts` from include (handled by tsconfig.node.json)
- Disabled declaration files generation (not needed for library)

## Remaining Type Errors

The following files have type errors that need to be fixed:

### High Priority (Core Functionality)

1. **src/components/price-predictor/Chart.tsx**
   - Multiple `possibly 'undefined'` errors
   - Need to add null checks or use optional chaining
   - Fix type mismatches with Plotly types

2. **src/components/price-predictor/Dashboard.tsx**
   - Fix `exactOptionalPropertyTypes` issues with optional props
   - Add proper type guards for undefined values

3. **src/components/price-predictor/AccuracyVisualizationChart.tsx**
   - Fix Plotly type mismatches
   - Ensure proper type casting for Plotly data

### Medium Priority (Code Quality)

4. **src/components/ARTryOnModal.tsx**
   - Remove unused imports (`Download`, `t`)
   - Fix missing return statement
   - Fix property access issues (`image` vs `images`, `purity`)

5. **src/components/AuctionsPage.tsx**
   - Remove unused variables
   - Remove unused imports

6. **src/components/Header.tsx**
   - Remove unused imports
   - Fix image import type declaration

7. **src/components/LoginPage.tsx**
   - Remove unused variables
   - Fix environment variable access

## Quick Fixes

### For "possibly 'undefined'" errors:
```typescript
// Before
const value = data.property;

// After
const value = data?.property ?? defaultValue;
// or
if (data?.property) {
  const value = data.property;
}
```

### For unused variables:
```typescript
// Remove the variable or prefix with underscore
const _unusedVar = value;
```

### For exactOptionalPropertyTypes:
```typescript
// Before
interface Props {
  optional?: string;
}

// After
interface Props {
  optional?: string | undefined;
}
```

## Testing

After fixing errors, run:
```bash
npm run type-check
```

All type errors should be resolved before merging to main branch.

