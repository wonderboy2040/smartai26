import { ETF } from '../types';

interface StatCardsProps {
  etfs: ETF[];
  usdInrRate: number;
}

export function StatCards({ etfs, usdInrRate }: StatCardsProps) {
  const totalValueINR = etfs.reduce((sum, etf) => {
    const value = etf.price * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? value * usdInrRate : value);
  }, 0);

  const dailyPL = etfs.reduce((sum, etf) => {
    const pl = etf.change * (etf.holdings || 0);
    return sum + (etf.market === 'US' ? pl * usdInrRate : pl);
  }, 0);
  
  const dailyPLPercent = totalValueINR > 0 ? ((dailyPL / (totalValueINR - dailyPL)) * 100) : 0;
  
  const buyCount = etfs.filter(e => e.signal === 'BUY').length;
  const holdCount = etfs.filter(e => e.signal === 'HOLD').length;
  const sellCount = etfs.filter(e => e.signal === 'SELL').length;
  
  const avgSentiment = etfs.reduce((sum, e) => sum + e.confidence, 0) / (etfs.length || 1);

  const cardStyle: React.CSSProperties = {
    background: 'rgba(20, 20, 35, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(100, 100, 150, 0.2)',
    padding: '20px 24px',
    transition: 'all 0.3s ease',
  };

  return (
    <div className="stats-grid" style={{ marginBottom: '24px' }}>
      <div style={{ ...cardStyle, borderTop: '3px solid #8b5cf6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio Value (INR)</span>
        </div>
        <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          ₹{totalValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: dailyPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {dailyPL >= 0 ? '▲' : '▼'} ₹{Math.abs(dailyPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="mono" style={{ fontSize: '13px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px', background: dailyPL >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: dailyPL >= 0 ? '#22c55e' : '#ef4444' }}>
            {dailyPL >= 0 ? '+' : ''}{dailyPLPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={{ ...cardStyle, borderTop: '3px solid #22c55e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🧠</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Sentiment</span>
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

      <div style={{ ...cardStyle, borderTop: '3px solid #06b6d4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Signals</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {[{ label: 'BUY', count: buyCount, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' }, { label: 'HOLD', count: holdCount, color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' }, { label: 'SELL', count: sellCount, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }].map(item => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: item.bg, borderRadius: '10px', border: `1px solid ${item.color}33` }}>
              <div className="mono" style={{ fontSize: '24px', fontWeight: '700', color: item.color, lineHeight: 1 }}>{item.count}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: item.color, marginTop: '4px', letterSpacing: '0.05em' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

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
