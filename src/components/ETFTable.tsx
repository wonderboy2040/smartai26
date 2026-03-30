import { useState } from 'react';
import { ETF } from '../types';

interface ETFTableProps {
  etfs: ETF[];
  selectedETF: ETF;
  onSelectETF: (etf: ETF) => void;
  getFlash: (id: string) => 'up' | 'down' | undefined;
  updateHoldings: (id: string, qty: number | string) => void; // New prop
}

type FilterType = 'ALL' | 'US' | 'IN';

export function ETFTable({ etfs, selectedETF, onSelectETF, getFlash, updateHoldings }: ETFTableProps) {
  // ... purana code same rahega (filter wagera)
  const [filter, setFilter] = useState<FilterType>('ALL');
  const filteredETFs = etfs.filter(etf => filter === 'ALL' || etf.market === filter);
  const formatPrice = (price: number, market: string) => market === 'US' ? `$${price.toFixed(2)}` : `₹${price.toFixed(2)}`;

  // SignalBadge function same rakhein...

  return (
    <div style={{ /* Same wrapper styling */ }}>
      {/* Header and filters... */}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.2)' }}>
              {/* Naya Column: Qty add kiya */}
              {['ETF', 'Price', 'Change', 'Qty (Holdings)', 'Value', 'AI Signal'].map(header => (
                <th key={header} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredETFs.map(etf => {
              const isSelected = selectedETF.id === etf.id;
              const flash = getFlash(etf.id);
              
              return (
                <tr
                  key={etf.id}
                  onClick={() => onSelectETF(etf)}
                  className={flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''}
                  style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.1)', cursor: 'pointer', background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}
                >
                  {/* ETF Info (Same) */}
                  <td style={{ padding: '16px 20px' }}> {/* ETF Symbol & Name code */} </td>
                  
                  {/* Price (Same) */}
                  <td style={{ padding: '16px 20px' }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                      {formatPrice(etf.price, etf.market)}
                    </span>
                  </td>

                  {/* Change (Same) */}
                  <td style={{ padding: '16px 20px' }}> {/* Change UI Code */} </td>

                  {/* BUG FIX: Fractional Qty Input Field */}
                  <td style={{ padding: '16px 20px' }}>
                    <input
                      type="number"
                      step="any"  // ANY step lagane se 1.18365661 work karega
                      value={etf.holdings || ''}
                      onChange={(e) => updateHoldings(etf.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0.00"
                      className="mono"
                      style={{
                        width: '90px',
                        padding: '6px 10px',
                        background: 'rgba(30, 30, 50, 0.8)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </td>

                  {/* Holding Value */}
                  <td style={{ padding: '16px 20px' }}>
                    <span className="mono" style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {formatPrice(etf.price * (etf.holdings || 0), etf.market)}
                    </span>
                  </td>

                  {/* Signal (Same) */}
                  <td style={{ padding: '16px 20px' }}> {/* SignalBadge UI */} </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
