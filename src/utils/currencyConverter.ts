// Currency conversion utilities
export const TROY_OUNCE_GRAMS = 31.1035;
export const PAWN_GRAMS = 8;

export interface ConvertedPrice {
  price: number;
  currency: string;
  unit: string;
  displayText: string;
}

/**
 * Convert gold price from USD per Troy Ounce to LKR per 1 Pawn
 * @param usdPerTroyOunce - Price in USD per Troy Ounce
 * @param usdToLkrRate - USD to LKR exchange rate
 * @returns Converted price in LKR per 1 Pawn
 */
export function convertTroyOunceToPawn(usdPerTroyOunce: number, usdToLkrRate: number): ConvertedPrice {
  // Convert USD per Troy Ounce to USD per gram
  const usdPerGram = usdPerTroyOunce / TROY_OUNCE_GRAMS;
  
  // Convert USD per gram to USD per Pawn (8 grams)
  const usdPerPawn = usdPerGram * PAWN_GRAMS;
  
  // Convert USD per Pawn to LKR per Pawn
  const lkrPerPawn = usdPerPawn * usdToLkrRate;
  
  // Format LKR in user-friendly way
  const formatLKR = (value: number) => {
    if (value >= 1000000) {
      return `LKR ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `LKR ${(value / 1000).toFixed(0)}K`;
    } else {
      return `LKR ${value.toFixed(0)}`;
    }
  };

  return {
    price: lkrPerPawn,
    currency: 'LKR',
    unit: '1 Pawn',
    displayText: formatLKR(lkrPerPawn)
  };
}

/**
 * Convert gold price from LKR per 1 Pawn back to USD per Troy Ounce
 * @param lkrPerPawn - Price in LKR per 1 Pawn
 * @param usdToLkrRate - USD to LKR exchange rate
 * @returns Converted price in USD per Troy Ounce
 */
export function convertPawnToTroyOunce(lkrPerPawn: number, usdToLkrRate: number): ConvertedPrice {
  // Convert LKR per Pawn to USD per Pawn
  const usdPerPawn = lkrPerPawn / usdToLkrRate;
  
  // Convert USD per Pawn to USD per gram
  const usdPerGram = usdPerPawn / PAWN_GRAMS;
  
  // Convert USD per gram to USD per Troy Ounce
  const usdPerTroyOunce = usdPerGram * TROY_OUNCE_GRAMS;
  
  return {
    price: usdPerTroyOunce,
    currency: 'USD',
    unit: 'Troy Ounce',
    displayText: `$${usdPerTroyOunce.toFixed(2)}`
  };
}

/**
 * Convert price based on selected unit
 * @param price - Original price in USD per Troy Ounce
 * @param unit - Target unit ('troy-ounce' or 'pawn')
 * @param usdToLkrRate - USD to LKR exchange rate
 * @returns Converted price information
 */
export function convertPrice(price: number, unit: 'troy-ounce' | 'pawn', usdToLkrRate: number): ConvertedPrice {
  if (unit === 'pawn') {
    return convertTroyOunceToPawn(price, usdToLkrRate);
  } else {
    return {
      price: price,
      currency: 'USD',
      unit: 'Troy Ounce',
      displayText: `$${price.toFixed(2)}`
    };
  }
}

/**
 * Convert chart data for display
 * @param data - Array of price data points
 * @param unit - Target unit ('troy-ounce' or 'pawn')
 * @param usdToLkrRate - USD to LKR exchange rate
 * @returns Converted chart data
 */
export function convertChartData(
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>,
  unit: 'troy-ounce' | 'pawn',
  usdToLkrRate: number
) {
  if (unit === 'troy-ounce') {
    return data;
  }
  
  return data.map(point => ({
    ...point,
    open: convertTroyOunceToPawn(point.open, usdToLkrRate).price,
    high: convertTroyOunceToPawn(point.high, usdToLkrRate).price,
    low: convertTroyOunceToPawn(point.low, usdToLkrRate).price,
    close: convertTroyOunceToPawn(point.close, usdToLkrRate).price,
  }));
}
