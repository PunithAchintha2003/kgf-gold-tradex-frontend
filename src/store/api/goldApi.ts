import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/core/api/baseApi';

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

export interface PredictionFactor {
  factor: string;
  value: string;
  interpretation: string;
  impact: 'Bullish' | 'Bearish' | 'Neutral' | 'Uncertain' | 'Stable';
  confidence: 'High' | 'Medium' | 'Low';
}

export interface PredictionExplanation {
  current_price: number;
  overall_sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentiment_explanation: string;
  factors: PredictionFactor[];
  summary: {
    bullish_factors: number;
    bearish_factors: number;
    neutral_factors: number;
    total_factors: number;
  };
  error?: string;
}

export interface ExchangeRateResponse {
  from_currency: string;
  to_currency: string;
  exchange_rate: number;
  timestamp: string;
  status: string;
  message?: string;
}

// New interfaces for accuracy visualization
export interface AccuracyDataPoint {
  date: string;
  predicted_price: number;
  actual_price: number;
  accuracy_percentage: number;
  error_absolute: number;
  error_percentage: number;
  method: string;
}

export interface AccuracyVisualizationStatistics {
  average_accuracy: number;
  min_accuracy: number;
  max_accuracy: number;
  average_error: number;
  total_predictions: number;
}

export interface AccuracyVisualizationResponse {
  status: string;
  data: AccuracyDataPoint[];
  statistics: AccuracyVisualizationStatistics;
  timestamp: string;
}

// New interfaces for prediction history
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

export const goldApi = createApi({
  reducerPath: 'goldApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DailyData', 'RealtimePrice', 'PredictionExplanation', 'ExchangeRate', 'AccuracyVisualization', 'PredictionHistory'],
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
    getPredictionExplanation: builder.query<PredictionExplanation, void>({
      query: () => '/xauusd/explanation',
      providesTags: ['PredictionExplanation'],
    }),
    getExchangeRate: builder.query<ExchangeRateResponse, { from: string; to: string }>({
      query: ({ from, to }) => `/exchange-rate/${from}/${to}`,
      providesTags: ['ExchangeRate'],
    }),
    getAccuracyVisualization: builder.query<AccuracyVisualizationResponse, void>({
      query: () => '/xauusd/accuracy-visualization',
      providesTags: ['AccuracyVisualization'],
    }),
    getPredictionHistory: builder.query<PredictionHistoryResponse, { days?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.days) searchParams.append('days', params.days.toString());
        const queryString = searchParams.toString();
        return `/xauusd/prediction-history${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['PredictionHistory'],
    }),
  }),
});

export const { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetPredictionExplanationQuery, 
  useGetExchangeRateQuery,
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery
} = goldApi;
