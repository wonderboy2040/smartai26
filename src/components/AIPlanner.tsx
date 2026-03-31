import { useState } from 'react';
import { ETF } from '../types';

interface PlannerProps {
  etfs: ETF[];
  usdInrRate: number;
}

export const AIPlanner = ({ etfs }: PlannerProps) => {
  const [inrWallet, setInrWallet] = useState<number>(500000);
  const [usdWallet, setUsdWallet] = useState<number>(10000);

  // Split Buy Candidates by Market
  const inCandidates = etfs.filter(e => e.signal === 'BUY' && e.market === 'IN');
  const usCandidates = etfs.filter(e => e.signal === 'BUY' && e.market === 'US');

  // Allocate dynamically based on strong signals
  const inrAllocPerAsset = inCandidates.length > 0 ? inrWallet / inCandidates.length : 0;
  const usdAllocPerAsset = usCandidates.length > 0 ? usdWallet / usCandidates.length : 0;

  return (
    <div style={{ background: '#131722', borderRadius: '12px', border: '1px solid #2A2E39', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #2A2E39', paddingBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🤖</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#D1D4DC', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Pro Planner</h3>
          <span style={{ fontSize: '11px', color: '#089981', fontWeight: '700' }}>Smart Split-Wallet Allocator</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ================= INDIA WALLET (INR) ================= */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#D1D4DC', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>🇮🇳 India Wallet (INR)</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', transition: 'border 0.3s' }}>
            <span style={{ color: '#D1D4DC', fontSize: '18px', marginRight: '10px', fontWeight: '700' }}>₹</span>
            <input type="number" value={inrWallet} onChange={(e) => setInrWallet(Number(e.target.value))} className="mono pro-input" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D1D4DC', fontSize: '18px', fontWeight: '700', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inCandidates.length === 0 ? (
              <div style={{ color: '#787B86', fontSize: '12px', textAlign: 'center', padding: '16px', background: '#0B0E14', borderRadius: '8px', border: '1px dashed #2A2E39' }}>No IN Buy Signals Detected</div>
            ) : (
              inCandidates.map(etf => {
                const suggestedQty = (inrAllocPerAsset / etf.price).toFixed(2);
                return (
                  <div key={etf.id} style={{ background: '#0B0E14', border: '1px solid #2A2E39', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #089981' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC' }}>{etf.symbol}</div>
                      <div style={{ fontSize: '11px', color: '#787B86', marginTop: '4px' }}>Allocated: ₹{inrAllocPerAsset.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Target Qty</div>
                      <div className="mono" style={{ fontSize: '16px', fontWeight: '700', color: '#089981' }}>{suggestedQty}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= USA WALLET (USD) ================= */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#D1D4DC', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>🇺🇸 USA Wallet (USD)</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', transition: 'border 0.3s' }}>
            <span style={{ color: '#D1D4DC', fontSize: '18px', marginRight: '10px', fontWeight: '700' }}>$</span>
            <input type="number" value={usdWallet} onChange={(e) => setUsdWallet(Number(e.target.value))} className="mono pro-input" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D1D4DC', fontSize: '18px', fontWeight: '700', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {usCandidates.length === 0 ? (
              <div style={{ color: '#787B86', fontSize: '12px', textAlign: 'center', padding: '16px', background: '#0B0E14', borderRadius: '8px', border: '1px dashed #2A2E39' }}>No US Buy Signals Detected</div>
            ) : (
              usCandidates.map(etf => {
                const suggestedQty = (usdAllocPerAsset / etf.price).toFixed(2);
                return (
                  <div key={etf.id} style={{ background: '#0B0E14', border: '1px solid #2A2E39', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #2962FF' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC' }}>{etf.symbol}</div>
                      <div style={{ fontSize: '11px', color: '#787B86', marginTop: '4px' }}>Allocated: ${usdAllocPerAsset.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Target Qty</div>
                      <div className="mono" style={{ fontSize: '16px', fontWeight: '700', color: '#2962FF' }}>{suggestedQty}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
