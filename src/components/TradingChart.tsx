import { useEffect, useRef, memo } from 'react';
import { ETF } from '../types';

interface TradingChartProps {
  selectedETF: ETF;
}

export const TradingChart = memo(({ selectedETF }: TradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Purano chart clean karo jyare navo ETF select thay
    containerRef.current.innerHTML = '';

    // TradingView mate Symbol mapping
    let tvSymbol = selectedETF.symbol;
    if (selectedETF.market === 'IN') {
      // India ETFs mostly NSE par list hoy chhe
      tvSymbol = `NSE:${selectedETF.symbol}`;
    } else {
      // US ETFs mapping
      if (selectedETF.symbol === 'XLK') {
        tvSymbol = `AMEX:XLK`;
      } else {
        tvSymbol = `NASDAQ:${selectedETF.symbol}`;
      }
    }

    // TradingView script dynamically inject karo
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${tvSymbol}",
        "interval": "1",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "in",
        "enable_publishing": false,
        "backgroundColor": "rgba(20, 20, 35, 0.2)",
        "gridColor": "rgba(100, 100, 150, 0.1)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }
    `;
    
    containerRef.current.appendChild(script);
  }, [selectedETF.symbol, selectedETF.market]);

  return (
    <div style={{ 
      background: 'rgba(20, 20, 35, 0.8)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '16px', 
      border: '1px solid rgba(100, 100, 150, 0.2)', 
      padding: '16px', 
      height: '550px', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>TradingView Live Chart</h3>
          <span style={{ fontSize: '12px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
            WebSocket Active
          </span>
        </div>
      </div>
      
      {/* TradingView Widget Container */}
      <div className="tradingview-widget-container" ref={containerRef} style={{ flex: 1, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
      </div>
    </div>
  );
});