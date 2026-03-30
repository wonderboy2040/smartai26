export interface ETF {
  id: string;
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  market: 'US' | 'IN';
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  rsi: number;
  macd: 'Bullish' | 'Bearish' | 'Neutral';
  trend: string;
  support: number;
  resistance: number;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  source: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AIInsight {
  id: number;
  type: 'opportunity' | 'risk' | 'info';
  title: string;
  description: string;
  confidence: number;
  etfSymbol?: string;
}

export interface PortfolioStats {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
}

export interface AIPerformance {
  accuracy: number;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number;
  totalSignals: number;
  successfulSignals: number;
}
