import { useState } from 'react';
import { ETF } from '../types';

interface ETFTableProps {
  etfs: ETF[];
  selectedETF: ETF | null;
  onSelectETF: (etf: ETF) => void;
  getFlash: (id: string) => 'up' | 'down' | undefined;
  updateAssetDetails: (id: string, qty: string, avgPrice: string) => void;
  addAsset: (asset: ETF) => void;
  deleteAsset: (id: string) => void;
  syncStatus: string;
  forceSave: () => void; // New prop for manual trigger
}

export function ETFTable({ etfs, selectedETF, onSelectETF, getFlash, updateAssetDetails, addAsset, deleteAsset, syncStatus, forceSave }: ETFTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newMarket, setNewMarket] = useState<'US' | 'IN'>('IN');

  const formatPrice = (price: number, market: string) => market === 'US' ? `$${price.toFixed(2)}` : `₹${price.toFixed(2)}`;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newName) return;
    addAsset({
      id: Date.now().toString(), symbol: newSymbol.toUpperCase(), name: newName, market: newMarket,
      price: 100, prevPrice: 100, change: 0, changePercent: 0, volume: '0', marketCap: '-',
      signal: 'HOLD', confidence: 50, rsi: 50, macd: 'Neutral', trend: 'Sideways',
      support: 90, resistance: 110, holdings: '', avgBuyPrice: '' // Default blank for smooth typing
    });
    setShowModal(false); setNewSymbol(''); setNewName('');
  };

  return (
    <>
      <div style={{ background: '#131722', borderRadius: '12px', border: '1px solid #2A2E39', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2E39', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#D1D4DC', margin: 0, textTransform: 'uppercase' }}>Assets Core</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1E222D', padding: '4px 10px', borderRadius: '4px' }}>
              <span className={`sync-dot ${syncStatus}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: syncStatus === 'synced' ? '#089981' : syncStatus === 'syncing' ? '#EAB308' : '#F23645' }}></span>
              <span style={{ color: '#787B86', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{syncStatus}</span>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding: '6px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', background: '#2962FF', color: '#fff', border: 'none', cursor: 'pointer' }}>+ ADD ASSET</button>
        </div>

        {/* Pro Data Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2E39', background: '#0B0E14' }}>
                {['Symbol', 'Live Price', 'Quantity', 'Avg Price', 'Hold Value', 'Unrealized P&L', ''].map(header => (
                  <th key={header} style={{ padding: '12px 20px', textAlign: header==='Symbol'?'left':'right', fontSize: '11px', fontWeight: '600', color: '#787B86', textTransform: 'uppercase' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {etfs.map(etf => {
                const isSelected = selectedETF?.id === etf.id;
                const flash = getFlash(etf.id);
                const safeHoldings = Number(etf.holdings) || 0;
                const safeAvg = Number(etf.avgBuyPrice) || 0;
                const currentVal = etf.price * safeHoldings;
                const pnl = currentVal - (safeAvg * safeHoldings);
                const pnlPercent = (safeAvg * safeHoldings) > 0 ? (pnl / (safeAvg * safeHoldings)) * 100 : 0;
                const isProf = pnl >= 0;

                return (
                  <tr key={etf.id} onClick={() => onSelectETF(etf)} style={{ borderBottom: '1px solid #1E222D', cursor: 'pointer', background: isSelected ? '#1E222D' : 'transparent', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '24px', background: etf.market === 'US' ? '#2962FF' : '#F59E0B', borderRadius: '4px' }}></div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC' }}>{etf.symbol}</div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div className={`mono price-cell ${flash}`} style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC', transition: 'all 0.3s' }}>
                        {formatPrice(etf.price, etf.market)}
                      </div>
                    </td>

                    {/* LAG & BUG FREE INPUTS */}
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <input 
                        type="number" 
                        step="any" 
                        value={etf.holdings} 
                        onChange={(e) => updateAssetDetails(etf.id, e.target.value, String(etf.avgBuyPrice))} 
                        onBlur={forceSave} // Syncs only when you click away!
                        onClick={(e) => e.stopPropagation()} 
                        className="mono pro-input" 
                        placeholder="0"
                        style={{ width: '80px', textAlign: 'right', padding: '6px 8px', borderRadius: '4px' }} 
                      />
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <input 
                        type="number" 
                        step="any" 
                        value={etf.avgBuyPrice} 
                        onChange={(e) => updateAssetDetails(etf.id, String(etf.holdings), e.target.value)} 
                        onBlur={forceSave} // Syncs only when you click away!
                        onClick={(e) => e.stopPropagation()} 
                        className="mono pro-input" 
                        placeholder="0.00"
                        style={{ width: '90px', textAlign: 'right', padding: '6px 8px', borderRadius: '4px' }} 
                      />
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: '14px', color: '#D1D4DC', fontWeight: '600' }}>{formatPrice(currentVal, etf.market)}</span>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="mono" style={{ fontSize: '14px', fontWeight: '700', color: isProf ? '#089981' : '#F23645' }}>
                          {isProf ? '+' : ''}{formatPrice(pnl, etf.market)}
                        </span>
                        <span style={{ fontSize: '11px', color: isProf ? '#089981' : '#F23645' }}>{isProf ? '+' : ''}{pnlPercent.toFixed(2)}%</span>
                       </div>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <button onClick={(e) => { e.stopPropagation(); deleteAsset(etf.id); }} style={{ background: 'transparent', color: '#50535E', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Same Modal as Before */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#131722', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #2A2E39', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#D1D4DC', marginBottom: '20px', textTransform: 'uppercase', fontSize: '16px' }}>Add Asset</h3>
            <form onSubmit={handleAddSubmit}>
              <input required type="text" placeholder="Symbol (e.g. QQQM)" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0B0E14', border: '1px solid #2A2E39', color: '#D1D4DC', marginBottom: '12px', borderRadius: '4px', outline: 'none' }} />
              <input required type="text" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0B0E14', border: '1px solid #2A2E39', color: '#D1D4DC', marginBottom: '12px', borderRadius: '4px', outline: 'none' }} />
              <select value={newMarket} onChange={e => setNewMarket(e.target.value as 'IN'|'US')} style={{ width: '100%', padding: '12px', background: '#0B0E14', border: '1px solid #2A2E39', color: '#D1D4DC', marginBottom: '24px', borderRadius: '4px', outline: 'none' }}>
                <option value="IN">Indian Market (NSE)</option>
                <option value="US">US Market (NASDAQ/NYSE)</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#2A2E39', color: '#D1D4DC', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2962FF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
