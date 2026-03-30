import { ETF, NewsItem, AIInsight, AIPerformance } from './types';

export const initialETFs: ETF[] = [
  // --- INDIA ETFs ---
  { id: '1', symbol: 'JUNIORBEES', name: 'Nippon India Junior BeES', price: 812.45, prevPrice: 812.45, change: 12.30, changePercent: 1.54, volume: '3.8M', marketCap: '₹4,521Cr', market: 'IN', signal: 'BUY', confidence: 88, rsi: 58, macd: 'Bullish', trend: 'Uptrend', support: 790.00, resistance: 840.00, holdings: 0, avgBuyPrice: 0 },
  { id: '2', symbol: 'MID150BEES', name: 'Nippon India Midcap 150', price: 185.20, prevPrice: 185.20, change: 2.15, changePercent: 1.17, volume: '1.2M', marketCap: '₹1,200Cr', market: 'IN', signal: 'BUY', confidence: 82, rsi: 60, macd: 'Bullish', trend: 'Uptrend', support: 180.00, resistance: 195.00, holdings: 0, avgBuyPrice: 0 },
  { id: '3', symbol: 'SMALLCAP', name: 'Nippon India Small Cap', price: 145.60, prevPrice: 145.60, change: 3.40, changePercent: 2.39, volume: '2.5M', marketCap: '₹2,100Cr', market: 'IN', signal: 'HOLD', confidence: 68, rsi: 65, macd: 'Neutral', trend: 'Sideways', support: 135.00, resistance: 155.00, holdings: 0, avgBuyPrice: 0 },
  { id: '4', symbol: 'MOMOMENTUM', name: 'Motilal Oswal Momentum', price: 210.45, prevPrice: 210.45, change: 4.20, changePercent: 2.04, volume: '800K', marketCap: '₹850Cr', market: 'IN', signal: 'BUY', confidence: 91, rsi: 70, macd: 'Bullish', trend: 'Strong Uptrend', support: 200.00, resistance: 225.00, holdings: 0, avgBuyPrice: 0 },
  
  // --- USA ETFs ---
  { id: '5', symbol: 'SMH', name: 'VanEck Semiconductor ETF', price: 225.50, prevPrice: 225.50, change: 5.10, changePercent: 2.31, volume: '8.5M', marketCap: '$18.2B', market: 'US', signal: 'BUY', confidence: 94, rsi: 65, macd: 'Bullish', trend: 'Strong Uptrend', support: 215.00, resistance: 235.00, holdings: 0, avgBuyPrice: 0 },
  { id: '6', symbol: 'QQQM', name: 'Invesco NASDAQ 100 ETF', price: 185.30, prevPrice: 185.30, change: 2.45, changePercent: 1.34, volume: '4.2M', marketCap: '$25.4B', market: 'US', signal: 'BUY', confidence: 85, rsi: 62, macd: 'Bullish', trend: 'Uptrend', support: 178.00, resistance: 192.00, holdings: 0, avgBuyPrice: 0 },
  { id: '7', symbol: 'XLK', name: 'Technology Select Sector', price: 210.80, prevPrice: 210.80, change: 3.20, changePercent: 1.54, volume: '6.7M', marketCap: '$65.8B', market: 'US', signal: 'HOLD', confidence: 78, rsi: 58, macd: 'Neutral', trend: 'Uptrend', support: 202.00, resistance: 218.00, holdings: 0, avgBuyPrice: 0 }
];

export const newsItems: NewsItem[] = [
  { id: 1, title: 'Semiconductor Demand Surges', summary: 'AI chip demand continues to outpace supply.', sentiment: 'bullish', source: 'Reuters', time: '18 min ago', impact: 'high' },
  { id: 2, title: 'India Midcap Rally Continues', summary: 'Domestic inflows drive mid and small cap segments.', sentiment: 'bullish', source: 'Economic Times', time: '42 min ago', impact: 'high' }
];

export const aiInsights: AIInsight[] = [
  { id: 1, type: 'opportunity', title: 'Strong Buy Signal: SMH', description: 'MACD crossover confirmed. AI projects upside.', confidence: 94, etfSymbol: 'SMH' },
  { id: 2, type: 'info', title: 'India Markets Breakout', description: 'Momentum showing strong FII inflows.', confidence: 88, etfSymbol: 'MOMOMENTUM' }
];

export const aiPerformance: AIPerformance = {
  accuracy: 94.2, sharpeRatio: 2.41, winRate: 78.6, maxDrawdown: 8.2, totalSignals: 1247, successfulSignals: 980
};