import { ETF } from '../types';

interface StatCardsProps {
  etfs: ETF[];
  usdInrRate: number; // New Prop
}

export function StatCards({ etfs, usdInrRate }: StatCardsProps) {
  // Pure portfolio ki value INR me calculate hogi (USD * INR Rate)
  const totalValueINR = etfs.reduce((sum, etf) => {
    const value = etf.price * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? value * usdInrRate : value);
  }, 0);

  // Profit/Loss calculation
  const dailyPL = etfs.reduce((sum, etf) => {
    const pl = etf.change * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? pl * usdInrRate : pl);
  }, 0);
  
  const dailyPLPercent = totalValueINR > 0 ? ((dailyPL / (totalValueINR - dailyPL)) * 100) : 0;
  
  // ... Baki existing count logic (BUY/HOLD/SELL) aur UI code same rakhein,
  // bas "Portfolio Value" block me `totalValueINR` dikhayein:
  
  return (
    <div className="stats-grid" style={{ marginBottom: '24px' }}>
      {/* Portfolio Value */}
      <div style={{ /* card styles */ }}>
        <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
          ₹{totalValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {/* dailyPL UI code here ... */}
      </div>
      {/* Baki cards AI Sentiment, Active Signals, Markets yahan pe pehle jaisa same... */}
    </div>
  );
}
