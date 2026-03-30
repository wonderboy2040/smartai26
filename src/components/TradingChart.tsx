import { ETF } from '../types';

interface TradingChartProps {
  selectedETF: ETF;
}

export function TradingChart({ selectedETF }: TradingChartProps) {
  const formatPrice = (price: number, market: string) => {
    return market === 'US' 
      ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const tradingViewSymbol = selectedETF.market === 'IN' 
    ? `NSE:${selectedETF.symbol}` 
    : selectedETF.symbol;

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(100, 100, 150, 0.2)',
      overflow: 'hidden',
    }}>
      {/* Chart Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(100, 100, 150, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* ETF Icon */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: selectedETF.market === 'US' 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
              : 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            border: `1px solid ${selectedETF.market === 'US' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
          }}>
            {selectedETF.market === 'US' ? '🇺🇸' : '🇮🇳'}
          </div>
          
          {/* ETF Info */}
          <div>
            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              {selectedETF.symbol}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '2px',
            }}>
              {selectedETF.name}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            {formatPrice(selectedETF.price, selectedETF.market)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '4px',
          }}>
            <span className="mono" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: selectedETF.change >= 0 ? '#22c55e' : '#ef4444',
            }}>
              {selectedETF.change >= 0 ? '+' : ''}{selectedETF.change.toFixed(2)}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '6px',
              background: selectedETF.change >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: selectedETF.change >= 0 ? '#22c55e' : '#ef4444',
            }}>
              {selectedETF.change >= 0 ? '▲' : '▼'} {Math.abs(selectedETF.changePercent).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Iframe */}
      <div style={{ height: '400px', background: '#0d1117' }}>
        <iframe
          key={selectedETF.symbol}
          title="TradingView Chart"
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=${tradingViewSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Quick Stats */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(100, 100, 150, 0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
      }}>
        {[
          { label: 'Volume', value: selectedETF.volume },
          { label: 'RSI (14)', value: selectedETF.rsi.toFixed(1), color: selectedETF.rsi > 70 ? '#ef4444' : selectedETF.rsi < 30 ? '#22c55e' : '#eab308' },
          { label: 'MACD', value: selectedETF.macd, color: selectedETF.macd === 'Bullish' ? '#22c55e' : selectedETF.macd === 'Bearish' ? '#ef4444' : '#eab308' },
          { label: 'Support', value: formatPrice(selectedETF.support, selectedETF.market) },
          { label: 'Resistance', value: formatPrice(selectedETF.resistance, selectedETF.market) },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              {stat.label}
            </div>
            <div className="mono" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: stat.color || '#e2e8f0',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
