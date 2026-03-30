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
    
    containerRef.current.innerHTML = '';
    setIsChartReady(false);

    // Advanced Symbol Mapping for Flawless Loading
    let tvSymbol = selectedETF.symbol;
    if (selectedETF.market === 'IN') {
      // BSE generally has better ETF charting support on TradingView for India, but we use NSE as requested
      tvSymbol = `BSE:${selectedETF.symbol}`; 
    } else {
      tvSymbol = selectedETF.symbol === 'XLK' ? `AMEX:XLK` : `NASDAQ:${selectedETF.symbol}`;
    }

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

    const timer = setTimeout(() => setIsChartReady(true), 1000);
    return () => clearTimeout(timer);
  }, [selectedETF?.symbol, selectedETF?.market]);

  if (!selectedETF) return null;

  return (
    <div style={{ 
      background: 'rgba(20, 20, 35, 0.8)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '16px', 
      border: '1px solid rgba(139, 92, 246, 0.3)', 
      padding: '16px', 
      height: '600px', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', flex: 1, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        {!isChartReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#0f0f1a', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
             <div className="animate-spin" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6' }}></div>
             <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>CONNECTING WSS SERVER...</span>
          </div>
        )}
        <div className="tradingview-widget-container" ref={containerRef} style={{ height: '100%', width: '100%' }}>
          <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
});