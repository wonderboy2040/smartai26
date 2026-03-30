import { ETF } from '../types';

interface AIAnalysisProps {
  selectedETF: ETF;
}

export function AIAnalysis({ selectedETF }: AIAnalysisProps) {
  const signalConfig = {
    BUY: { 
      gradient: 'linear-gradient(135deg, #065f46, #047857, #059669)',
      icon: '🚀',
      action: 'Strong buying opportunity detected',
    },
    HOLD: { 
      gradient: 'linear-gradient(135deg, #854d0e, #a16207, #ca8a04)',
      icon: '⏸️',
      action: 'Wait for clearer market signals',
    },
    SELL: { 
      gradient: 'linear-gradient(135deg, #991b1b, #b91c1c, #dc2626)',
      icon: '⚠️',
      action: 'Consider reducing exposure',
    },
  }[selectedETF.signal];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b, #312e81, #3730a3)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(139, 92, 246, 0.3)',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '24px' }}>🧠</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                DeepMind AI Analysis
              </span>
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#fff',
            }}>
              {selectedETF.symbol}
            </h3>
          </div>

          {/* Signal Badge */}
          <div style={{
            background: signalConfig.gradient,
            padding: '10px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{signalConfig.icon}</div>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '0.05em',
            }}>
              {selectedETF.signal}
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              AI Confidence
            </span>
            <span className="mono" style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
            }}>
              {selectedETF.confidence}%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${selectedETF.confidence}%`,
              height: '100%',
              background: selectedETF.confidence >= 80 
                ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                : selectedETF.confidence >= 60 
                  ? 'linear-gradient(90deg, #eab308, #facc15)' 
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
              borderRadius: '10px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}>
          {[
            { 
              label: 'RSI (14)', 
              value: selectedETF.rsi.toFixed(1),
              status: selectedETF.rsi > 70 ? 'Overbought' : selectedETF.rsi < 30 ? 'Oversold' : 'Normal',
              color: selectedETF.rsi > 70 ? '#ef4444' : selectedETF.rsi < 30 ? '#22c55e' : '#eab308',
            },
            { 
              label: 'MACD', 
              value: selectedETF.macd,
              status: selectedETF.macd === 'Bullish' ? 'Buy Signal' : selectedETF.macd === 'Bearish' ? 'Sell Signal' : 'No Signal',
              color: selectedETF.macd === 'Bullish' ? '#22c55e' : selectedETF.macd === 'Bearish' ? '#ef4444' : '#eab308',
            },
            { 
              label: 'Trend', 
              value: selectedETF.trend,
              status: selectedETF.trend.includes('Up') ? 'Positive' : selectedETF.trend.includes('Down') ? 'Negative' : 'Neutral',
              color: selectedETF.trend.includes('Up') ? '#22c55e' : selectedETF.trend.includes('Down') ? '#ef4444' : '#eab308',
            },
            { 
              label: 'Volume', 
              value: selectedETF.volume,
              status: 'Active',
              color: '#06b6d4',
            },
          ].map(metric => (
            <div key={metric.label} style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}>
                {metric.label}
              </div>
              <div className="mono" style={{
                fontSize: '18px',
                fontWeight: '700',
                color: metric.color,
                marginBottom: '4px',
              }}>
                {metric.value}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}>
                {metric.status}
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendation */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              AI Recommendation
            </span>
          </div>
          <p style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.8)',
          }}>
            {signalConfig.action}. RSI at <strong style={{ color: '#fff' }}>{selectedETF.rsi.toFixed(1)}</strong> with 
            MACD showing <strong style={{ color: '#fff' }}>{selectedETF.macd}</strong> momentum. 
            Current trend: <strong style={{ color: '#fff' }}>{selectedETF.trend}</strong>.
            {selectedETF.signal === 'BUY' && ' Consider building position with stop-loss below support.'}
            {selectedETF.signal === 'HOLD' && ' Monitor for breakout above resistance or breakdown below support.'}
            {selectedETF.signal === 'SELL' && ' Consider taking profits and reducing position size.'}
          </p>
        </div>
      </div>
    </div>
  );
}
