import { NewsItem } from '../types';
import { newsItems } from '../data';

export function NewsFeed() {
  const sentimentConfig = {
    bullish: {
      bg: 'rgba(34, 197, 94, 0.15)',
      color: '#22c55e',
      icon: '📈',
    },
    bearish: {
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      icon: '📉',
    },
    neutral: {
      bg: 'rgba(100, 116, 139, 0.15)',
      color: '#94a3b8',
      icon: '➡️',
    },
  };

  const impactConfig = {
    high: { color: '#ef4444', label: 'HIGH IMPACT' },
    medium: { color: '#eab308', label: 'MEDIUM' },
    low: { color: '#64748b', label: 'LOW' },
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
          <span style={{ fontSize: '20px' }}>📰</span>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#fff',
          }}>
            Market News
          </h3>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <span className="animate-pulse" style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
          }} />
          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            color: '#22c55e',
            letterSpacing: '0.05em',
          }}>
            LIVE 24/7
          </span>
        </div>
      </div>

      {/* News List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {newsItems.map((news: NewsItem) => {
          const sentiment = sentimentConfig[news.sentiment];
          const impact = impactConfig[news.impact];

          return (
            <div
              key={news.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(100, 100, 150, 0.1)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(100, 100, 150, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Title */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '16px' }}>{sentiment.icon}</span>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                  flex: 1,
                }}>
                  {news.title}
                </h4>
              </div>

              {/* Summary */}
              <p style={{
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#94a3b8',
                marginLeft: '28px',
                marginBottom: '10px',
              }}>
                {news.summary}
              </p>

              {/* Meta */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '28px',
              }}>
                <span style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: '500',
                }}>
                  {news.source}
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{
                  fontSize: '11px',
                  color: '#64748b',
                }}>
                  {news.time}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '700',
                  background: sentiment.bg,
                  color: sentiment.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}>
                  {news.sentiment}
                </span>
                {news.impact === 'high' && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: '700',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: impact.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>
                    {impact.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
