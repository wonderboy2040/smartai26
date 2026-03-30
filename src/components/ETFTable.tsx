import { useState } from 'react';
import { ETF } from '../types';

interface ETFTableProps {
  etfs: ETF[];
  selectedETF: ETF;
  onSelectETF: (etf: ETF) => void;
  getFlash: (id: string) => 'up' | 'down' | undefined;
  updateHoldings: (id: string, qty: string) => void;
}

type FilterType = 'ALL' | 'US' | 'IN';

export function ETFTable({ etfs, selectedETF, onSelectETF, getFlash, updateHoldings }: ETFTableProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredETFs = etfs.filter(etf => filter === 'ALL' || etf.market === filter);

  const formatPrice = (price: number, market: string) => {
    return market === 'US' ? `$${price.toFixed(2)}` : `₹${price.toFixed(2)}`;
  };

  const SignalBadge = ({ signal, confidence }: { signal: string; confidence: number }) => {
    const config = {
      BUY: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
      HOLD: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
      SELL: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
    }[signal] || { bg: '#1e293b', color: '#94a3b8', border: '#334155' };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          {signal === 'BUY' ? '▲' : signal === 'SELL' ? '▼' : '●'} {signal}
        </span>
        <span className="mono" style={{ fontSize: '11px', color: '#64748b' }}>{confidence}%</span>
      </div>
    );
  };

  return (
    <div style={{ background: 'rgba(20, 20, 35, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(100, 100, 150, 0.2)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(100, 100, 150, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>ETF Watchlist</h3>
          <span style={{ fontSize: '12px', color: '#64748b', padding: '4px 10px', background: 'rgba(100, 100, 150, 0.2)', borderRadius: '6px' }}>{filteredETFs.length} ETFs</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'US', 'IN'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: filter === f ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(100, 100, 150, 0.2)', color: filter === f ? '#fff' : '#94a3b8', border: filter === f ? 'none' : '1px solid rgba(100, 100, 150, 0.3)' }}>
              {f === 'ALL' ? '🌐 All' : f === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.2)' }}>
              {['ETF', 'Price', 'Change', 'Volume', 'Qty (Holdings)', 'Value', 'AI Signal', 'Action'].map(header => (
                <th key={header} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredETFs.map(etf => {
              const isSelected = selectedETF.id === etf.id;
              const flash = getFlash(etf.id);
              return (
                <tr key={etf.id} onClick={() => onSelectETF(etf)} className={flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''} style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.1)', cursor: 'pointer', background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: etf.market === 'US' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' : 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        {etf.market === 'US' ? '🇺🇸' : '🇮🇳'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{etf.symbol}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etf.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{formatPrice(etf.price, etf.market)}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="mono" style={{ fontSize: '13px', fontWeight: '600', color: etf.change >= 0 ? '#22c55e' : '#ef4444' }}>{etf.change >= 0 ? '+' : ''}{etf.change.toFixed(2)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: '600', color: etf.change >= 0 ? '#22c55e' : '#ef4444' }}>{etf.change >= 0 ? '▲' : '▼'} {Math.abs(etf.changePercent).toFixed(2)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{etf.volume}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <input
                      type="number"
                      step="any"
                      value={etf.holdings || ''}
                      onChange={(e) => updateHoldings(etf.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0.00"
                      className="mono"
                      style={{ width: '90px', padding: '6px 10px', background: 'rgba(30, 30, 50, 0.8)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="mono" style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {formatPrice(etf.price * (etf.holdings || 0), etf.market)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <SignalBadge signal={etf.signal} confidence={etf.confidence} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={(e) => { e.stopPropagation(); onSelectETF(etf); }} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: isSelected ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(139, 92, 246, 0.15)', color: isSelected ? '#fff' : '#a78bfa', border: isSelected ? 'none' : '1px solid rgba(139, 92, 246, 0.3)' }}>
                      {isSelected ? '✓ Selected' : 'View Chart'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
