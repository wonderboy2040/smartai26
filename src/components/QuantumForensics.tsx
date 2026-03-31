import { memo } from 'react';
import { ETF } from '../types';

export const QuantumForensics = memo(({ selectedETF }: { selectedETF: ETF | null }) => {
  if (!selectedETF) return null;

  const isOversold = selectedETF.rsi <= 40;
  const high = selectedETF.price * 1.15; // Simulated Swing High
  const low = selectedETF.price * 0.85;  // Simulated Swing Low
  const diff = high - low;
  
  const fibLevels = [
    { label: '0.236 (Minor Resistance)', val: high - (diff * 0.236), color: '#ef4444' },
    { label: '0.382 (Pullback Zone)', val: high - (diff * 0.382), color: '#eab308' },
    { label: '0.500 (Equilibrium)', val: high - (diff * 0.500), color: '#3b82f6' },
    { label: '0.618 (Golden Pocket)', val: high - (diff * 0.618), color: '#22c55e' }
  ];

  return (
    <div style={{ background: 'rgba(15, 15, 26, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(100,100,150,0.2)', paddingBottom: '12px' }}>
        <div style={{ fontSize: '24px' }}>🔬</div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0, textTransform: 'uppercase' }}>Quantum Forensics</h3>
          <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '600' }}>Deep AI & Fib Matrix</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pine Script Match */}
        <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Strategy Signal Match</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: isOversold ? '#22c55e' : '#eab308' }}>
            {isOversold ? '🔥 Strong Buy-On-Dip Detected' : '⏳ Wait for Deeper Correction'}
          </div>
        </div>

        {/* Dynamic Fibonacci Matrix */}
        <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Dynamic Fibonacci Matrix</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {fibLevels.map(fib => (
              <div key={fib.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{fib.label}</span>
                <span className="mono" style={{ fontSize: '13px', fontWeight: '700', color: fib.color }}>
                  {selectedETF.market === 'US' ? '$' : '₹'}{fib.val.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
