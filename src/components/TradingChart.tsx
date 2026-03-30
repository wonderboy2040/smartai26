import { useEffect, useRef, memo, useState } from 'react';
import { ETF } from '../types';

interface TradingChartProps {
  selectedETF: ETF | null;
}

export const TradingChart = memo(({ selectedETF }: TradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !selectedETF) return;
    
    // Purana chart clean karo jab naya asset select ho
    containerRef.current.innerHTML = '';
    setIsChartReady(false);

    // TradingView WebSocket Symbol Mapping (Ultra Fast Datafeed)
    let tvSymbol = selectedETF.symbol;
    if (selectedETF.market === 'IN') {
      tvSymbol = `NSE:${selectedETF.symbol}`; // Indian Assets ke liye NSE WebSockets
    } else {
      if (selectedETF.symbol === 'XLK') {
        tvSymbol = `AMEX:XLK`;
      } else {
        tvSymbol = `NASDAQ:${selectedETF.symbol}`; // US Assets ke liye NASDAQ WebSockets
      }
    }

    // Advanced DeepMind TradingView Setup Config
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${tvSymbol}",
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "in",
        "enable_publishing": false,
        "backgroundColor": "#0f0f1a",
        "gridColor": "rgba(100, 100, 150, 0.05)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": false,
        "details": true,
        "hotlist": false,
        "calendar": false,
        "support_host": "https://www.tradingview.com",
        "studies": [
          "RSI@tv-basicstudies",
          "BB@tv-basicstudies",
          "MAExp@tv-basicstudies"
        ]
      }
    `;
    
    containerRef.current.appendChild(script);

    // Chart load UI animation
    const timer = setTimeout(() => setIsChartReady(true), 800);
    return () => clearTimeout(timer);
  }, [selectedETF?.symbol, selectedETF?.market]);

  if (!selectedETF) return null;

  // Real-time AI Scanner Logic (Simulating the Pine Script condition in React)
  // Check if price is near support/lower band and RSI is low
  const isOversold = selectedETF.rsi <= 40;
  const isNearSupport = selectedETF.price <= (selectedETF.support * 1.05);
  const isBuyZone = isOversold && isNearSupport;

  return (
    <div style={{ 
      background: 'rgba(20, 20, 35, 0.8)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '16px', 
      border: '1px solid rgba(139, 92, 246, 0.3)', 
      padding: '16px', 
      height: '650px', // Thoda bada height Pro Tools ke liye
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      {/* 1. DeepMind AI Real-Time Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(100,100,150,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 0 15px rgba(139,92,246,0.4)' }}>
            🧠
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>DeepMind TV Integration</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
              <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600', letterSpacing: '0.05em' }}>WSS ULTRA-FAST</span>
            </div>
          </div>
        </div>

        {/* AI Strategy Live Scanner Display */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(30,30,50,0.6)', border: '1px solid rgba(100,100,150,0.2)' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>RSI Status</span>
            <span className="mono" style={{ fontSize: '13px', fontWeight: '700', color: isOversold ? '#22c55e' : '#eab308' }}>
              {selectedETF.rsi.toFixed(1)} {isOversold ? '(Oversold)' : '(Neutral)'}
            </span>
          </div>
          
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: isBuyZone ? 'rgba(34,197,94,0.15)' : 'rgba(30,30,50,0.6)', border: `1px solid ${isBuyZone ? 'rgba(34,197,94,0.4)' : 'rgba(100,100,150,0.2)'}` }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>AI DeepMind Signal</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: isBuyZone ? '#22c55e' : '#94a3b8' }}>
              {isBuyZone ? '🟢 EXTREME BUY ZONE' : '🟡 WAITING FOR DIP'}
            </span>
          </div>
        </div>

      </div>
      
      {/* 2. TradingView Widget Container */}
      <div style={{ position: 'relative', flex: 1, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(100,100,150,0.1)' }}>
        
        {/* Loading Overlay */}
        {!isChartReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0f0f1a', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
             <div className="animate-spin" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6' }}></div>
             <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>CONNECTING TO EXCHANGE...</span>
          </div>
        )}

        <div className="tradingview-widget-container" ref={containerRef} style={{ height: '100%', width: '100%' }}>
          <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
        </div>
      </div>

    </div>
  );
});