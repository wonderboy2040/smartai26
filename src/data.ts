import { ETF, NewsItem, AIInsight, AIPerformance } from './types';

export const initialETFs: ETF[] = [
  // --- USA ETFs (Prices in USD $) ---
  {
    id: '1', symbol: 'SMH', name: 'VanEck Semiconductor ETF', 
    price: 225.40, prevPrice: 225.40, change: 2.10, changePercent: 0.94, 
    volume: '8.5M', marketCap: '$24.5B', market: 'US', signal: 'BUY', 
    confidence: 94, rsi: 65, macd: 'Bullish', trend: 'Strong Uptrend', support: 218.00, resistance: 230.00
  },
  {
    id: '2', symbol: 'QQQM', name: 'Invesco NASDAQ 100 ETF', 
    price: 184.25, prevPrice: 184.25, change: 1.15, changePercent: 0.63, 
    volume: '12.1M', marketCap: '$28.2B', market: 'US', signal: 'BUY', 
    confidence: 88, rsi: 60, macd: 'Bullish', trend: 'Uptrend', support: 178.00, resistance: 188.00
  },
  {
    id: '3', symbol: 'XLK', name: 'Technology Select Sector SPDR', 
    price: 205.80, prevPrice: 205.80, change: 0.95, changePercent: 0.46, 
    volume: '6.4M', marketCap: '$65.1B', market: 'US', signal: 'HOLD', 
    confidence: 72, rsi: 55, macd: 'Neutral', trend: 'Sideways', support: 200.00, resistance: 210.00
  },

  // --- INDIA ETFs (Prices in INR ₹) ---
  {
    id: '4', symbol: 'JUNIORBEES', name: 'Nippon India Junior BeES', 
    price: 812.45, prevPrice: 812.45, change: 12.30, changePercent: 1.54, 
    volume: '3.8M', marketCap: '₹4,521Cr', market: 'IN', signal: 'BUY', 
    confidence: 82, rsi: 58, macd: 'Bullish', trend: 'Uptrend', support: 790.00, resistance: 840.00
  },
  {
    id: '5', symbol: 'MID150BEES', name: 'Nippon India Midcap 150', 
    price: 185.30, prevPrice: 185.30, change: 3.45, changePercent: 1.90, 
    volume: '2.5M', marketCap: '₹1,250Cr', market: 'IN', signal: 'BUY', 
    confidence: 89, rsi: 62, macd: 'Bullish', trend: 'Strong Uptrend', support: 175.00, resistance: 195.00
  },
  {
    id: '6', symbol: 'SMALLCAP', name: 'Nippon India Smallcap ETF', 
    price: 142.60, prevPrice: 142.60, change: -1.20, changePercent: -0.83, 
    volume: '4.1M', marketCap: '₹3,100Cr', market: 'IN', signal: 'HOLD', 
    confidence: 65, rsi: 48, macd: 'Neutral', trend: 'Consolidation', support: 135.00, resistance: 150.00
  },
  {
    id: '7', symbol: 'MOMOMENTUM', name: 'Nifty 200 Momentum 30 ETF', 
    price: 310.75, prevPrice: 310.75, change: 5.80, changePercent: 1.90, 
    volume: '1.2M', marketCap: '₹850Cr', market: 'IN', signal: 'BUY', 
    confidence: 91, rsi: 68, macd: 'Bullish', trend: 'Uptrend', support: 295.00, resistance: 325.00
  }
];

// Yahan aapke newsItems aur aiInsights aayenge (purane wale rakh sakte hain ya unhe bhi customize kar lein)
export const newsItems: NewsItem[] = []; 
export const aiInsights: AIInsight[] = [];