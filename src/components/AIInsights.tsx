import { AIInsight } from '../types';
import { aiInsights } from '../data';

export function AIInsights() {
  const typeConfig = {
    opportunity: {
      icon: '🎯',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      color: '#22c55e',
      label: 'Opportunity',
    },
    risk: {
      icon: '⚠️',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      color: '#ef4444',
      label: 'Risk Alert',
    },
    info: {
      icon: '💡',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.3)',
      color: '#818cf8',
      label: 'Insight',
    },
  };

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(100, 100, 150, 0.2)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(100, 100, 150, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔮</span>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#fff',
          }}>
            AI Insights
          </h3>
        </div>
        <span style={{
          fontSize: '11px',
          color: '#22c55e',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span className="animate-pulse" style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
          }} />
          24/7 Analysis
        </span>
      </div>

      {/* Insights List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {aiInsights.slice(0, 4).map((insight: AIInsight) => {
          const config = typeConfig[insight.type];
          
          return (
            <div
              key={insight.id}
              style={{
                background: config.bg,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${config.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>{config.icon}</span>
                  <div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: config.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {config.label}
                    </span>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      marginTop: '2px',
                    }}>
                      {insight.title}
                    </h4>
                  </div>
                </div>
                {insight.etfSymbol && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                  }}>
                    {insight.etfSymbol}
                  </span>
                )}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#94a3b8',
                marginBottom: '12px',
              }}>
                {insight.description}
              </p>

              {/* Confidence Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${insight.confidence}%`,
                    height: '100%',
                    background: config.color,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span className="mono" style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                }}>
                  {insight.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
