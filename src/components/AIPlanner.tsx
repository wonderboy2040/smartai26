import { useState } from 'react';
import { ETF } from '../types';

interface PlannerProps {
  etfs: ETF[];
  usdInrRate: number;
}

export const AIPlanner = ({ etfs, usdInrRate }: PlannerProps) => {
  const [inrWallet, setInrWallet] = useState<number>(500000);
  const [usdWallet, setUsdWallet] = useState<number>(10000);
  
  // Long-Term Investment Settings
  const [years, setYears] = useState<number>(15);
  const [cagr, setCagr] = useState<number>(15);

  const inCandidates = etfs.filter(e => e.signal === 'BUY' && e.market === 'IN');
  const usCandidates = etfs.filter(e => e.signal === 'BUY' && e.market === 'US');

  const inrAllocPerAsset = inCandidates.length > 0 ? inrWallet / inCandidates.length : 0;
  const usdAllocPerAsset = usCandidates.length > 0 ? usdWallet / usCandidates.length : 0;

  // CAGR Calculation
  const totalInvestedINR = inrWallet + (usdWallet * usdInrRate);
  const futureValue = totalInvestedINR * Math.pow((1 + cagr / 100), years);
  const netProfit = futureValue - totalInvestedINR;

  return (
    <div style={{ background: '#131722', borderRadius: '12px', border: '1px solid #2A2E39', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #2A2E39', paddingBottom: '16px' }}>
        <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(8,153,129,0.6))' }}>🤖</span>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#D1D4DC', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Pro Planner</h3>
          <span style={{ fontSize: '11px', color: '#089981', fontWeight: '700' }}>Split-Wallet & Long-Term CAGR</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* INDIA WALLET */}
        <div>
          <label style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px', display: 'block' }}>🇮🇳 India Wallet (INR)</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ color: '#089981', fontSize: '16px', marginRight: '8px', fontWeight: '700' }}>₹</span>
            <input type="number" value={inrWallet} onChange={(e) => setInrWallet(Number(e.target.value))} className="mono pro-input" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D1D4DC', fontSize: '16px', fontWeight: '700', outline: 'none' }} />
          </div>
        </div>

        {/* USA WALLET */}
        <div>
          <label style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px', display: 'block' }}>🇺🇸 USA Wallet (USD)</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ color: '#2962FF', fontSize: '16px', marginRight: '8px', fontWeight: '700' }}>$</span>
            <input type="number" value={usdWallet} onChange={(e) => setUsdWallet(Number(e.target.value))} className="mono pro-input" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D1D4DC', fontSize: '16px', fontWeight: '700', outline: 'none' }} />
          </div>
        </div>
      </div>

      {/* CAGR LONG TERM PROJECTION SECTION */}
      <div style={{ background: 'linear-gradient(135deg, rgba(8,153,129,0.1), rgba(11,14,20,0.8))', border: '1px solid rgba(8,153,129,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', color: '#089981', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>Long-Term Wealth Projection</h4>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Time Horizon (Years)</label>
            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="mono" style={{ width: '100%', padding: '8px', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '4px', color: '#D1D4DC', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Expected CAGR (%)</label>
            <input type="number" value={cagr} onChange={(e) => setCagr(Number(e.target.value))} className="mono" style={{ width: '100%', padding: '8px', background: '#0B0E14', border: '1px solid #2A2E39', borderRadius: '4px', color: '#D1D4DC', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', fontWeight: '600' }}>Estimated Future Value</div>
            <div className="mono" style={{ fontSize: '24px', fontWeight: '800', color: '#D1D4DC', marginTop: '4px' }}>
              ₹{futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase' }}>Wealth Gained</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: '#089981' }}>
              +₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* ALLOCATION SUGGESTIONS */}
      <div style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px' }}>Current Buy Zone Assets Allocation</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
        {[...inCandidates, ...usCandidates].length === 0 ? (
          <div style={{ color: '#787B86', fontSize: '12px', textAlign: 'center', padding: '16px', background: '#0B0E14', borderRadius: '8px', border: '1px dashed #2A2E39' }}>No Active Buy Signals Detected</div>
        ) : (
          [...inCandidates, ...usCandidates].map(etf => {
            const isIN = etf.market === 'IN';
            const allocAmt = isIN ? inrAllocPerAsset : usdAllocPerAsset;
            const targetQty = (allocAmt / etf.price).toFixed(2);
            
            return (
              <div key={etf.id} style={{ background: '#0B0E14', border: '1px solid #2A2E39', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${isIN ? '#089981' : '#2962FF'}` }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC' }}>{etf.symbol}</div>
                  <div style={{ fontSize: '11px', color: '#787B86', marginTop: '2px' }}>Allocated: {isIN ? '₹' : '$'}{allocAmt.toLocaleString(isIN ? 'en-IN' : 'en-US', {maximumFractionDigits:0})}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#787B86', textTransform: 'uppercase', fontWeight: '600' }}>Target Qty</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: '700', color: isIN ? '#089981' : '#2962FF' }}>{targetQty}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
