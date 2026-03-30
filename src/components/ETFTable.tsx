import { useState } from 'react';
import { ETF } from '../types';

interface ETFTableProps {
  etfs: ETF[];
  selectedETF: ETF;
  onSelectETF: (etf: ETF) => void;
  getFlash: (id: string) => 'up' | 'down' | undefined;
  updateAssetDetails: (id: string, qty: string, avgPrice: string) => void;
  addAsset: (asset: ETF) => void;
  deleteAsset: (id: string) => void;
  forceSave: () => void;
}

type FilterType = 'ALL' | 'US' | 'IN';

export function ETFTable({ etfs, selectedETF, onSelectETF, getFlash, updateAssetDetails, addAsset, deleteAsset, forceSave }: ETFTableProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  
  // Modal State
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newMarket, setNewMarket] = useState<'US' | 'IN'>('IN');
  const [newQty, setNewQty] = useState('');
  const [newAvgPrice, setNewAvgPrice] = useState('');

  const filteredETFs = etfs.filter(etf => filter === 'ALL' || etf.market === filter);

  const formatPrice = (price: number, market: string) => {
    return market === 'US' ? `$${price.toFixed(2)}` : `₹${price.toFixed(2)}`;
  };

  const handleSaveClick = () => {
    forceSave();
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newName) return;

    const newAsset: ETF = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      name: newName,
      market: newMarket,
      price: Number(newAvgPrice) || 100, // Temp initial price
      prevPrice: Number(newAvgPrice) || 100,
      change: 0,
      changePercent: 0,
      volume: '0M',
      marketCap: '-',
      signal: 'HOLD',
      confidence: 50,
      rsi: 50,
      macd: 'Neutral',
      trend: 'Sideways',
      support: (Number(newAvgPrice) || 100) * 0.9,
      resistance: (Number(newAvgPrice) || 100) * 1.1,
      holdings: Number(newQty) || 0,
      avgBuyPrice: Number(newAvgPrice) || 0
    };

    addAsset(newAsset);
    setShowModal(false);
    setNewSymbol(''); setNewName(''); setNewQty(''); setNewAvgPrice('');
  };

  return (
    <>
      <div style={{ background: 'rgba(20, 20, 35, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(100, 100, 150, 0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(100, 100, 150, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💼</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>My Portfolio</h3>
            <span style={{ fontSize: '12px', color: '#64748b', padding: '4px 10px', background: 'rgba(100, 100, 150, 0.2)', borderRadius: '6px' }}>{filteredETFs.length} Assets</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleSaveClick} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', background: saveIndicator ? '#22c55e' : 'rgba(139, 92, 246, 0.15)', color: saveIndicator ? '#fff' : '#a78bfa', border: `1px solid ${saveIndicator ? '#22c55e' : 'rgba(139, 92, 246, 0.3)'}`, cursor: 'pointer', transition: 'all 0.3s ease' }}>
              {saveIndicator ? '✓ Saved!' : '💾 Save Assets'}
            </button>
            <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', cursor: 'pointer' }}>
              + Add Asset
            </button>
            {(['ALL', 'US', 'IN'] as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: filter === f ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(100, 100, 150, 0.2)', color: filter === f ? '#fff' : '#94a3b8', border: filter === f ? 'none' : '1px solid rgba(100, 100, 150, 0.3)', cursor: 'pointer' }}>
                {f === 'ALL' ? '🌐 All' : f === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.2)', background: 'rgba(0,0,0,0.2)' }}>
                {['Asset', 'CMP (Live)', 'Qty', 'Avg Price', 'Invested', 'Current Val', 'Overall P&L', 'Action'].map(header => (
                  <th key={header} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredETFs.map(etf => {
                const isSelected = selectedETF?.id === etf.id;
                const flash = getFlash(etf.id);
                const invested = etf.avgBuyPrice * etf.holdings;
                const currentVal = etf.price * etf.holdings;
                const pnl = currentVal - invested;
                const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

                return (
                  <tr key={etf.id} onClick={() => onSelectETF(etf)} className={flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''} style={{ borderBottom: '1px solid rgba(100, 100, 150, 0.1)', cursor: 'pointer', background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}>
                    
                    {/* ASSET */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: etf.market === 'US' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' : 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                          {etf.market === 'US' ? '🇺🇸' : '🇮🇳'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{etf.symbol}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etf.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* CMP */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="mono" style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{formatPrice(etf.price, etf.market)}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: etf.change >= 0 ? '#22c55e' : '#ef4444' }}>{etf.change >= 0 ? '▲' : '▼'} {Math.abs(etf.changePercent).toFixed(2)}%</span>
                      </div>
                    </td>

                    {/* QTY INPUT */}
                    <td style={{ padding: '16px' }}>
                      <input type="number" step="any" value={etf.holdings || ''} onChange={(e) => updateAssetDetails(etf.id, e.target.value, etf.avgBuyPrice.toString())} onClick={(e) => e.stopPropagation()} placeholder="0" className="mono" style={{ width: '70px', padding: '6px 8px', background: 'rgba(30, 30, 50, 0.8)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                    </td>

                    {/* AVG PRICE INPUT */}
                    <td style={{ padding: '16px' }}>
                      <input type="number" step="any" value={etf.avgBuyPrice || ''} onChange={(e) => updateAssetDetails(etf.id, etf.holdings.toString(), e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="0.00" className="mono" style={{ width: '80px', padding: '6px 8px', background: 'rgba(30, 30, 50, 0.8)', border: '1px solid #06b6d444', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                    </td>

                    {/* INVESTED */}
                    <td style={{ padding: '16px' }}>
                      <span className="mono" style={{ fontSize: '13px', color: '#94a3b8' }}>{formatPrice(invested, etf.market)}</span>
                    </td>

                    {/* CURRENT VAL */}
                    <td style={{ padding: '16px' }}>
                      <span className="mono" style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{formatPrice(currentVal, etf.market)}</span>
                    </td>

                    {/* OVERALL P&L */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: pnl >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${pnl >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                        <span className="mono" style={{ fontSize: '13px', fontWeight: '700', color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                          {pnl >= 0 ? '+' : ''}{formatPrice(pnl, etf.market)}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                          {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPercent).toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={(e) => { e.stopPropagation(); deleteAsset(etf.id); }} style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontSize: '14px' }} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredETFs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No assets found. Click "+ Add Asset" to build your portfolio.</div>
          )}
        </div>
      </div>

      {/* Modal UI same but with inputs for Qty & Avg Price */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e1e2e', padding: '24px', borderRadius: '16px', width: '400px', border: '1px solid rgba(139, 92, 246, 0.5)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span>➕</span> Add New Asset</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Symbol (e.g. RELIANCE, AAPL)</label>
                <input required type="text" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Asset Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Quantity</label>
                  <input type="number" step="any" value={newQty} onChange={e => setNewQty(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Avg Buy Price</label>
                  <input type="number" step="any" value={newAvgPrice} onChange={e => setNewAvgPrice(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Market</label>
                <select value={newMarket} onChange={e => setNewMarket(e.target.value as 'IN'|'US')} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                  <option value="IN">🇮🇳 Indian Market</option>
                  <option value="US">🇺🇸 US Market</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(100,100,150,0.3)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}