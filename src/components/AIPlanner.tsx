import { useState } from 'react';
import { ETF } from '../types';

interface PlannerProps {
  etfs: ETF[];
  usdInrRate: number;
}

export const AIPlanner = ({ etfs, usdInrRate }: PlannerProps) => {
  const [wallet, setWallet] = useState<number>(500000);

  // DeepMind Logic: Filter only strong BUY signals and allocate dynamically
  const buyCandidates = etfs.filter(e => e.signal === 'BUY');
  const allocationPerAsset = wallet / (buyCandidates.length || 1);

  return (
    <div style={{ background: 'rgba(20, 20, 35, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>🤖</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>AI Pro Planner</h3>
          <span style={{ fontSize: '11px', color: '#22c55e' }}>Buy-on-Dip Wallet Allocator</span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Available Investment Wallet (INR)</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,100,150,0.3)', borderRadius: '8px', padding: '10px' }}>
          <span style={{ color: '#fff', fontSize: '18px', marginRight: '8px' }}>₹</span>
          <input type="number" value={wallet} onChange={(e) => setWallet(Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', fontWeight: '700', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {buyCandidates.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No Assets in Strong Buy Zone. Wait for market dip.</div>
        ) : (
          buyCandidates.map(etf => {
            const currentPriceINR = etf.market === 'US' ? etf.price * usdInrRate : etf.price;
            const suggestedQty = (allocationPerAsset / currentPriceINR).toFixed(2);
            
            return (
              <div key={etf.id} style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{etf.symbol}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Allocated: ₹{allocationPerAsset.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700', textTransform: 'uppercase' }}>Target Qty</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{suggestedQty}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
