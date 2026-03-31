import { ETF } from '../types';

interface StatCardsProps {
  etfs: ETF[];
  usdInrRate: number;
}

export function StatCards({ etfs, usdInrRate }: StatCardsProps) {
  // P&L Calculations (Bug-Free Float Math)
  const totalInvestedINR = etfs.reduce((sum, etf) => {
    const val = (Number(etf.avgBuyPrice) || 0) * (Number(etf.holdings) || 0);
    return sum + (etf.market === 'US' ? val * usdInrRate : val);
  }, 0);

  const totalCurrentValueINR = etfs.reduce((sum, etf) => {
    const val = etf.price * (Number(etf.holdings) || 0);
    return sum + (etf.market === 'US' ? val * usdInrRate : val);
  }, 0);

  const overallPL = totalCurrentValueINR - totalInvestedINR;
  const overallPLPercent = totalInvestedINR > 0 ? (overallPL / totalInvestedINR) * 100 : 0;
  
  const dailyPL = etfs.reduce((sum, etf) => {
    const pl = etf.change * (Number(etf.holdings) || 0);
    return sum + (etf.market === 'US' ? pl * usdInrRate : pl);
  }, 0);
  const dailyPLPercent = totalCurrentValueINR > 0 ? ((dailyPL / (totalCurrentValueINR - dailyPL)) * 100) : 0;
  
  const avgSentiment = etfs.length > 0 ? etfs.reduce((sum, e) => sum + e.confidence, 0) / etfs.length : 50;

  // Pro-Level Card Styling
  const cardStyle: React.CSSProperties = { 
    background: '#131722', 
    borderRadius: '12px', 
    border: '1px solid #2A2E39', 
    padding: '20px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  };

  return (
    <div className="stats-grid" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      
      {/* 1. CURRENT VALUE */}
      <div style={{ ...cardStyle, borderTop: '3px solid #2962FF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#787B86', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Value (INR)</span>
          <span style={{ fontSize: '16px' }}>💰</span>
        </div>
        <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: '#D1D4DC', marginBottom: '12px' }}>
          ₹{totalCurrentValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B0E14', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1E222D' }}>
          <span style={{ fontSize: '11px', color: '#787B86', fontWeight: '600', textTransform: 'uppercase' }}>Today's P&L</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '14px', fontWeight: '700', color: dailyPL >= 0 ? '#089981' : '#F23645' }}>
              {dailyPL >= 0 ? '+' : ''}₹{Math.abs(dailyPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: dailyPL >= 0 ? '#089981' : '#F23645', background: dailyPL >= 0 ? 'rgba(8, 153, 129, 0.1)' : 'rgba(242, 54, 69, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
              {dailyPL >= 0 ? '▲' : '▼'} {Math.abs(dailyPLPercent).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. OVERALL INVESTED & P&L */}
      <div style={{ ...cardStyle, borderTop: '3px solid #F59E0B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#787B86', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invested & Net P&L</span>
          <span style={{ fontSize: '16px' }}>📈</span>
        </div>
        <div className="mono" style={{ fontSize: '24px', fontWeight: '700', color: '#A3A6AF', marginBottom: '12px' }}>
          ₹{totalInvestedINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B0E14', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1E222D' }}>
          <span style={{ fontSize: '11px', color: '#787B86', fontWeight: '600', textTransform: 'uppercase' }}>Net Return</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '14px', fontWeight: '700', color: overallPL >= 0 ? '#089981' : '#F23645' }}>
              {overallPL >= 0 ? '+' : ''}₹{Math.abs(overallPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: overallPL >= 0 ? '#089981' : '#F23645', background: overallPL >= 0 ? 'rgba(8, 153, 129, 0.1)' : 'rgba(242, 54, 69, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
              {overallPL >= 0 ? '▲' : '▼'} {Math.abs(overallPLPercent).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI CONFIDENCE */}
      <div style={{ ...cardStyle, borderTop: '3px solid #089981' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#787B86', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deep AI Confidence</span>
          <span style={{ fontSize: '16px' }}>🧠</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
          <span className="mono" style={{ fontSize: '32px', fontWeight: '700', color: avgSentiment >= 70 ? '#089981' : avgSentiment >= 50 ? '#EAB308' : '#F23645' }}>
            {avgSentiment.toFixed(0)}%
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: avgSentiment >= 70 ? '#089981' : avgSentiment >= 50 ? '#EAB308' : '#F23645' }}>
            {avgSentiment >= 70 ? 'Bullish Trend' : avgSentiment >= 50 ? 'Neutral Zone' : 'Bearish Trend'}
          </span>
        </div>
        <div style={{ height: '8px', background: '#0B0E14', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2A2E39' }}>
          <div style={{ width: `${avgSentiment}%`, height: '100%', background: avgSentiment >= 70 ? '#089981' : avgSentiment >= 50 ? '#EAB308' : '#F23645', borderRadius: '4px', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* 4. MARKETS STATUS */}
      <div style={{ ...cardStyle, borderTop: '3px solid #8B5CF6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#787B86', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Markets</span>
          <span style={{ fontSize: '16px' }}>🌍</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[{ flag: '🇺🇸', name: 'US (NASDAQ/NYSE)', isOpen: true }, { flag: '🇮🇳', name: 'INDIA (NSE/BSE)', isOpen: false }].map(market => (
            <div key={market.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0B0E14', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1E222D' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{market.flag}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#D1D4DC' }}>{market.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={market.isOpen ? 'animate-pulse' : ''} style={{ width: '8px', height: '8px', borderRadius: '50%', background: market.isOpen ? '#089981' : '#F23645', boxShadow: market.isOpen ? '0 0 8px #089981' : 'none' }}></span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: market.isOpen ? '#089981' : '#F23645', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {market.isOpen ? 'Active' : 'Closed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
