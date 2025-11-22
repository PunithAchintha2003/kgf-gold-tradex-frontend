import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DailyDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  predicted_price?: number; // Optional: Backend now includes predicted_price in data array for dates before Oct 6
}

export interface HistoricalPrediction {
  date: string;
  predicted_price: number;
  actual_price?: number;
}

export interface Prediction {
  next_day: string;
  predicted_price: number;
  current_price: number;
  prediction_method: string;
}

export interface AccuracyStats {
  average_accuracy: number;
  r2_score: number;
  total_predictions: number;
  evaluated_predictions: number;
}

export interface DailyDataResponse {
  symbol: string;
  timeframe: string;
  data: DailyDataPoint[];
  historical_predictions: HistoricalPrediction[];
  accuracy_stats: AccuracyStats;
  current_price: number;
  prediction?: Prediction;
  timestamp: string;
  status: string;
  message?: string;
}

export interface RealtimePriceResponse {
  symbol: string;
  current_price: number;
  timestamp: string;
  status: string;
  message?: string;
}

export interface TopFeature {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
}

export interface EnhancedPredictionResponse {
  status: string;
  prediction: {
    next_day_price: number;
    current_price: number;
    change: number;
    change_percentage: number;
    method: string;
  };
  sentiment: {
    combined_sentiment: number;
    news_volume: number;
    sentiment_trend: number;
  };
  top_features: TopFeature[];
  timestamp: string;
}

export interface AccuracyDataPoint {
  date: string;
  predicted_price: number;
  actual_price: number;
  accuracy_percentage: number;
  error_absolute: number;
  error_percentage: number;
  method: string;
}

export interface AccuracyStatistics {
  average_accuracy: number;
  min_accuracy: number;
  max_accuracy: number;
  average_error: number;
  total_predictions: number;
}

export interface AccuracyVisualizationResponse {
  status: string;
  data: AccuracyDataPoint[];
  statistics: AccuracyStatistics;
  timestamp: string;
}

export interface PredictionHistoryItem {
  date: string;
  predicted_price: number;
  actual_price: number | null;
  accuracy_percentage: number | null;
  status: 'pending' | 'completed';
  method: string;
}

export interface PredictionHistoryResponse {
  status: string;
  predictions: PredictionHistoryItem[];
  total: number;
}

export interface ExchangeRateResponse {
  from_currency: string;
  to_currency: string;
  exchange_rate: number;
  timestamp: string;
  status: string;
  message?: string;
}

// Use environment variable for API URL, fallback to production backend
// TEMPORARY: Using production URL even in development (change to localhost:8001 if running local backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kgf-gold-price-predictor.onrender.com';

export const goldApi = createApi({
  reducerPath: 'goldApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['DailyData', 'RealtimePrice', 'EnhancedPrediction', 'AccuracyVisualization', 'PredictionHistory', 'ExchangeRate'],
  endpoints: (builder) => ({
    getDailyData: builder.query<DailyDataResponse, { days?: number; start_date?: string; end_date?: string } | void>({
      query: (params) => {
        if (!params) return '/xauusd';
        const searchParams = new URLSearchParams();
        if (params.days) searchParams.append('days', params.days.toString());
        if (params.start_date) searchParams.append('start_date', params.start_date);
        if (params.end_date) searchParams.append('end_date', params.end_date);
        const queryString = searchParams.toString();
        return `/xauusd${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['DailyData'],
    }),
    getRealtimePrice: builder.query<RealtimePriceResponse, void>({
      query: () => '/xauusd/realtime',
      providesTags: ['RealtimePrice'],
    }),
    getEnhancedPrediction: builder.query<EnhancedPredictionResponse, void>({
      query: () => '/xauusd/enhanced-prediction',
      providesTags: ['EnhancedPrediction'],
    }),
    getAccuracyVisualization: builder.query<AccuracyVisualizationResponse, void>({
      query: () => '/xauusd/accuracy-visualization',
      providesTags: ['AccuracyVisualization'],
    }),
    getPredictionHistory: builder.query<PredictionHistoryResponse, { days?: number } | void>({
      query: (params) => {
        if (!params?.days) return '/xauusd/prediction-history';
        return `/xauusd/prediction-history?days=${params.days}`;
      },
      providesTags: ['PredictionHistory'],
    }),
    getExchangeRate: builder.query<ExchangeRateResponse, { from: string; to: string }>({
      query: ({ from, to }) => `/exchange-rate/${from}/${to}`,
      providesTags: ['ExchangeRate'],
    }),
  }),
});

export const { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetEnhancedPredictionQuery, 
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery,
  useGetExchangeRateQuery 
} = goldApi;
