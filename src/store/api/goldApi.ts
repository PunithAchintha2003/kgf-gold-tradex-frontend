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

// Enhanced prediction interfaces
export interface EnhancedPrediction {
  next_day_price: number;
  current_price: number;
  change: number;
  change_percentage: number;
  method: string;
}

export interface ModelInfo {
  name: string;
  type: string;
  r2_score: number | null;
  features: {
    total: number;
    selected: number;
    top_features: string[];
  };
  fallback_available: boolean;
}

export interface SentimentInfo {
  combined_sentiment: number;
  news_volume: number;
  sentiment_trend: number;
}

export interface EnhancedPredictionResponse {
  status: string;
  prediction: EnhancedPrediction;
  model: ModelInfo;
  sentiment: SentimentInfo;
  top_features: string[];
  timestamp: string;
  message?: string;
}

// Detailed Model Info interfaces
export interface LiveAccuracyStats {
  average_accuracy: number;
  r2_score: number | null;
  total_predictions: number;
  evaluated_predictions: number;
}

export interface DetailedModelInfo {
  active_model: string | null;
  model_type: string | null;
  training_r2_score: number | null;
  live_r2_score: number | null;
  r2_score: number | null;
  features_count: number | null;
  selected_features_count: number | null;
  fallback_available: boolean;
  live_accuracy_stats: LiveAccuracyStats | null;
  selected_features?: string[];
  total_features?: number | null;
}

export interface R2Explanation {
  training_r2_score: string;
  live_r2_score: string;
  r2_score: string;
}

export interface ModelInfoResponse {
  status: string;
  model: DetailedModelInfo;
  r2_explanation: R2Explanation;
  timestamp: string;
  message?: string;
}

// Prediction Stats interfaces
export interface EvaluatedStats {
  count: number;
  with_results: number;
  average_accuracy: number;
}

export interface PendingStats {
  count: number;
  awaiting_market_results: number;
}

export interface PredictionStatsData {
  total_predictions: number;
  evaluated: EvaluatedStats;
  pending: PendingStats;
  r2_score: number | null;
  evaluation_rate_percent: number;
}

export interface PredictionStatsResponse {
  status: string;
  data: PredictionStatsData;
  message?: string;
}

// Pending Predictions interfaces
export interface PendingPredictionItem {
  date: string;
  predicted_price: number;
  method: string;
}

export interface PendingPredictionsData {
  pending_count: number;
  predictions: PendingPredictionItem[];
}

export interface PendingPredictionsResponse {
  status: string;
  data: PendingPredictionsData;
  message?: string;
}

// Update Pending Predictions interfaces
export interface UpdatePendingPredictionsResponse {
  status: string;
  message: string;
  updated_count: number;
  failed_count: number;
  skipped_count?: number;
  updated_dates?: string[];
  failed_dates?: Array<{ date: string; error: string }>;
  skipped_dates?: string[];
  total_pending?: number;
}

export const goldApi = createApi({
  reducerPath: 'goldApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DailyData', 'RealtimePrice', 'PredictionExplanation', 'ExchangeRate', 'AccuracyVisualization', 'PredictionHistory', 'EnhancedPrediction', 'ModelInfo', 'PredictionStats', 'PendingPredictions'],
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
    getEnhancedPrediction: builder.query<EnhancedPredictionResponse, void>({
      query: () => '/xauusd/enhanced-prediction',
      providesTags: ['EnhancedPrediction'],
    }),
    getModelInfo: builder.query<ModelInfoResponse, void>({
      query: () => '/xauusd/model-info',
      providesTags: ['ModelInfo'],
    }),
    getPredictionStats: builder.query<PredictionStatsResponse, void>({
      query: () => '/xauusd/prediction-stats',
      providesTags: ['PredictionStats'],
    }),
    getPendingPredictions: builder.query<PendingPredictionsResponse, void>({
      query: () => '/xauusd/pending-predictions',
      providesTags: ['PendingPredictions'],
    }),
    updatePendingPredictions: builder.mutation<UpdatePendingPredictionsResponse, void>({
      query: () => ({
        url: '/xauusd/update-pending-predictions',
        method: 'POST',
      }),
      invalidatesTags: ['PendingPredictions', 'PredictionHistory', 'PredictionStats', 'AccuracyVisualization'],
    }),
  }),
});

export const { 
  useGetDailyDataQuery, 
  useGetRealtimePriceQuery, 
  useGetPredictionExplanationQuery, 
  useGetExchangeRateQuery,
  useGetAccuracyVisualizationQuery,
  useGetPredictionHistoryQuery,
  useGetEnhancedPredictionQuery,
  useGetModelInfoQuery,
  useGetPredictionStatsQuery,
  useGetPendingPredictionsQuery,
  useUpdatePendingPredictionsMutation
} = goldApi;
