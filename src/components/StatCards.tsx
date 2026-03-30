import { ETF } from '../types';

interface StatCardsProps {
  etfs: ETF[];
  usdInrRate: number;
}

export function StatCards({ etfs, usdInrRate }: StatCardsProps) {
  // Advanced Math for Portfolio Tracking
  const totalInvestedINR = etfs.reduce((sum, etf) => {
    const val = (etf.avgBuyPrice || 0) * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? val * usdInrRate : val);
  }, 0);

  const totalCurrentValueINR = etfs.reduce((sum, etf) => {
    const val = etf.price * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? val * usdInrRate : val);
  }, 0);

  const overallPL = totalCurrentValueINR - totalInvestedINR;
  const overallPLPercent = totalInvestedINR > 0 ? (overallPL / totalInvestedINR) * 100 : 0;
  
  const dailyPL = etfs.reduce((sum, etf) => {
    const pl = etf.change * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? pl * usdInrRate : pl);
  }, 0);
  const dailyPLPercent = totalCurrentValueINR > 0 ? ((dailyPL / (totalCurrentValueINR - dailyPL)) * 100) : 0;
  
  const avgSentiment = etfs.length > 0 ? etfs.reduce((sum, e) => sum + e.confidence, 0) / etfs.length : 50;

  const cardStyle: React.CSSProperties = { background: 'rgba(20, 20, 35, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(100, 100, 150, 0.2)', padding: '20px 24px', transition: 'all 0.3s ease' };

  return (
    <div className="stats-grid" style={{ marginBottom: '24px' }}>
      
      {/* 1. CURRENT VALUE & DAILY P&L */}
      <div style={{ ...cardStyle, borderTop: '3px solid #8b5cf6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Value (INR)</span>
        </div>
        <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          ₹{totalCurrentValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          Today's P&L: 
          <span style={{ fontWeight: '700', color: dailyPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {dailyPL >= 0 ? '▲' : '▼'} ₹{Math.abs(dailyPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ background: dailyPL >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px', color: dailyPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {dailyPL >= 0 ? '+' : ''}{dailyPLPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 2. OVERALL INVESTED & OVERALL P&L */}
      <div style={{ ...cardStyle, borderTop: '3px solid #0ea5e9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>📈</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invested & Net P&L</span>
        </div>
        <div className="mono" style={{ fontSize: '24px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
          ₹{totalInvestedINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: overallPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {overallPL >= 0 ? '▲' : '▼'} ₹{Math.abs(overallPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="mono" style={{ fontSize: '13px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: overallPL >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: overallPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {overallPL >= 0 ? '+' : ''}{overallPLPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 3. AI SENTIMENT */}
      <div style={{ ...cardStyle, borderTop: '3px solid #22c55e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🧠</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span className="mono" style={{ fontSize: '28px', fontWeight: '700', color: avgSentiment >= 70 ? '#22c55e' : avgSentiment >= 50 ? '#eab308' : '#ef4444' }}>
            {avgSentiment.toFixed(0)}%
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>Bullish</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(100, 100, 150, 0.3)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${avgSentiment}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* 4. MARKETS */}
      <div style={{ ...cardStyle, borderTop: '3px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🌍</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Markets</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[{ flag: '🇺🇸', name: 'NYSE/NASDAQ', status: 'Open', isOpen: true }, { flag: '🇮🇳', name: 'NSE/BSE', status: 'Closed', isOpen: false }].map(market => (
            <div key={market.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(30, 30, 50, 0.5)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{market.flag}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#cbd5e1' }}>{market.name}</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: market.isOpen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: market.isOpen ? '#22c55e' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{market.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}