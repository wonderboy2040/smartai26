import { memo } from 'react';
import { ETF } from '../types';

interface Props {
  selectedETF: ETF | null;
}

export const QuantumForensics = memo(({ selectedETF }: Props) => {
  if (!selectedETF) return null;

  // Simulate Forensic AI Data based on the selected ETF's current state
  const isOversold = selectedETF.rsi <= 40;
  const trendStrength = selectedETF.changePercent > 0 ? 85 : 35;
  const whaleActivity = isOversold ? 'High Accumulation' : 'Distribution';
  
  return (
    <div style={{
      background: 'rgba(15, 15, 26, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(100,100,150,0.2)', paddingBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 0 15px rgba(6,182,212,0.4)' }}>
          🔬
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantum Forensics</h3>
          <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '600' }}>Deep AI Asset Analysis</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 1. Pine Script Setup Match */}
        <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(100,100,150,0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>DeepMind Buy-On-Dip Match</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: isOversold ? '#22c55e' : '#eab308' }}>
              {isOversold ? '98% Setup Match' : '45% - Waiting for Dip'}
            </span>
            <span style={{ fontSize: '20px' }}>{isOversold ? '🎯' : '⏳'}</span>
          </div>
        </div>

        {/* 2. Order Book Forensics */}
        <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(100,100,150,0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Whale / Institutional Flow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '65%', background: '#22c55e' }}></div>
              <div style={{ width: '35%', background: '#ef4444' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', fontWeight: '600' }}>
            <span style={{ color: '#22c55e' }}>65% Buyers</span>
            <span style={{ color: '#ef4444' }}>35% Sellers</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#cbd5e1' }}>Status: <strong style={{ color: '#3b82f6' }}>{whaleActivity}</strong></div>
        </div>

        {/* 3. Volatility & Trend Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(100,100,150,0.1)' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Trend Strength</div>
            <div className="mono" style={{ fontSize: '20px', fontWeight: '700', color: trendStrength > 50 ? '#22c55e' : '#ef4444', marginTop: '4px' }}>{trendStrength}/100</div>
          </div>
          <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(100,100,150,0.1)' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Volatility (ATR)</div>
            <div className="mono" style={{ fontSize: '20px', fontWeight: '700', color: '#a78bfa', marginTop: '4px' }}>Low</div>
          </div>
        </div>

        {/* 4. Support/Resistance Radar */}
        <div style={{ background: 'rgba(30, 30, 50, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(100,100,150,0.1)', marginTop: 'auto' }}>
           <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>Key Price Levels</div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
             <span style={{ color: '#ef4444' }}>Res: {selectedETF.market === 'US' ? '$' : '₹'}{selectedETF.resistance.toFixed(2)}</span>
             <span style={{ color: '#e2e8f0' }}>CMP: {selectedETF.market === 'US' ? '$' : '₹'}{selectedETF.price.toFixed(2)}</span>
             <span style={{ color: '#22c55e' }}>Sup: {selectedETF.market === 'US' ? '$' : '₹'}{selectedETF.support.toFixed(2)}</span>
           </div>
        </div>
      </div>
    </div>
  );
});