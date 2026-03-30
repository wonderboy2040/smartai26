import { aiPerformance } from '../data';

export function AIPerformance() {
  const metrics = [
    {
      label: 'Signal Accuracy',
      value: `${aiPerformance.accuracy}%`,
      color: '#22c55e',
      icon: '🎯',
      description: 'Overall prediction accuracy',
    },
    {
      label: 'Sharpe Ratio',
      value: aiPerformance.sharpeRatio.toFixed(2),
      color: '#8b5cf6',
      icon: '📊',
      description: 'Risk-adjusted returns',
    },
    {
      label: 'Win Rate',
      value: `${aiPerformance.winRate}%`,
      color: '#06b6d4',
      icon: '🏆',
      description: 'Profitable signals',
    },
    {
      label: 'Max Drawdown',
      value: `-${aiPerformance.maxDrawdown}%`,
      color: '#f59e0b',
      icon: '📉',
      description: 'Largest peak-to-trough',
    },
  ];

  return (
    <div style={{
      background: 'rgba(20, 20, 35, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(100, 100, 150, 0.2)',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#fff',
          }}>
            AI Performance
          </h3>
        </div>
        <span style={{
          fontSize: '11px',
          color: '#64748b',
          padding: '4px 10px',
          background: 'rgba(100, 100, 150, 0.2)',
          borderRadius: '6px',
        }}>
          Last 30 days
        </span>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '16px',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#8b5cf6',
          }}>
            {aiPerformance.totalSignals}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Total Signals
          </div>
        </div>
        <div style={{
          width: '1px',
          height: '40px',
          background: 'rgba(139, 92, 246, 0.3)',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#22c55e',
          }}>
            {aiPerformance.successfulSignals}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Successful
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {metrics.map(metric => (
          <div
            key={metric.label}
            style={{
              background: 'rgba(30, 30, 50, 0.8)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(100, 100, 150, 0.2)',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = metric.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 100, 150, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>{metric.icon}</span>
            <div className="mono" style={{
              fontSize: '24px',
              fontWeight: '700',
              color: metric.color,
              marginTop: '8px',
              marginBottom: '4px',
            }}>
              {metric.value}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '4px',
            }}>
              {metric.label}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#64748b',
            }}>
              {metric.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
