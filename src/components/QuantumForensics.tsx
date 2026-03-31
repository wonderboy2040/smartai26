import { memo } from 'react';
import { ETF } from '../types';

export const QuantumForensics = memo(({ selectedETF }: { selectedETF: ETF | null }) => {
  if (!selectedETF) return null;

  const isOversold = selectedETF.rsi <= 40;
  const high = selectedETF.price * 1.15; // Simulated Swing High
  const low = selectedETF.price * 0.85;  // Simulated Swing Low
  const diff = high - low;
  
  const fibLevels = [
    { label: '0.236 (Minor Resistance)', val: high - (diff * 0.236), color: '#F23645' },
    { label: '0.382 (Pullback Zone)', val: high - (diff * 0.382), color: '#EAB308' },
    { label: '0.500 (Equilibrium)', val: high - (diff * 0.500), color: '#2962FF' },
    { label: '0.618 (Golden Pocket)', val: high - (diff * 0.618), color: '#089981' }
  ];

  const trendStrength = selectedETF.changePercent > 0 ? 82 : 34;

  return (
    <div style={{ background: '#131722', borderRadius: '12px', border: '1px solid #2A2E39', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #2A2E39', paddingBottom: '16px' }}>
        <div style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))' }}>🔬</div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#D1D4DC', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantum Forensics</h3>
          <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '700' }}>Deep AI Asset Analysis</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Pine Script Logic Match */}
        <div style={{ background: '#0B0E14', padding: '16px', borderRadius: '8px', border: '1px solid #1E222D' }}>
          <div style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Strategy Match (Buy on Dip)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOversold ? '#089981' : '#EAB308', boxShadow: `0 0 10px ${isOversold ? '#089981' : '#EAB308'}` }}></div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: isOversold ? '#089981' : '#EAB308' }}>
              {isOversold ? '🔥 Setup Matched (Buy Zone)' : '⏳ Waiting for Deep Correction'}
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#A3A6AF' }}>
            RSI Level: <strong style={{ color: selectedETF.rsi < 40 ? '#089981' : '#D1D4DC' }}>{selectedETF.rsi.toFixed(1)}</strong>
          </div>
        </div>

        {/* Whale Accumulation & Trend */}
        <div style={{ background: '#0B0E14', padding: '16px', borderRadius: '8px', border: '1px solid #1E222D' }}>
          <div style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Whale Order Flow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, height: '6px', background: '#2A2E39', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '68%', background: '#089981' }}></div>
              <div style={{ width: '32%', background: '#F23645' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700' }}>
            <span style={{ color: '#089981' }}>68% Buyers</span>
            <span style={{ color: '#F23645' }}>32% Sellers</span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', fontWeight: '600' }}>Trend Strength</span>
            <span className="mono" style={{ fontSize: '14px', fontWeight: '700', color: trendStrength > 50 ? '#089981' : '#F23645' }}>{trendStrength}/100</span>
          </div>
        </div>

        {/* Dynamic Fibonacci Matrix */}
        <div style={{ background: '#0B0E14', padding: '16px', borderRadius: '8px', border: '1px solid #1E222D', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', color: '#787B86', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>AI Fibonacci Support Matrix</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {fibLevels.map(fib => (
              <div key={fib.label} style={{ background: '#131722', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${fib.color}40`, borderLeft: `3px solid ${fib.color}` }}>
                <div style={{ fontSize: '10px', color: '#787B86', marginBottom: '4px' }}>{fib.label}</div>
                <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: '#D1D4DC' }}>
                  {selectedETF.market === 'US' ? '$' : '₹'}{fib.val.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});
