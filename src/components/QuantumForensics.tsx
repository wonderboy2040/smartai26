export const QuantumForensics = ({ selectedETF }: { selectedETF: any }) => {
  const high = selectedETF.price * 1.1;
  const low = selectedETF.price * 0.9;
  const diff = high - low;
  
  // Fibonacci Levels
  const levels = [
    { label: '0.236 (Pullback)', val: high - (diff * 0.236) },
    { label: '0.382 (Support)', val: high - (diff * 0.382) },
    { label: '0.618 (Golden Ratio)', val: high - (diff * 0.618) }
  ];

  return (
    <div style={{ background: '#0a0a1a', padding: '20px', borderRadius: '16px', border: '1px solid #06b6d4' }}>
      <h4 style={{ color: '#06b6d4', textTransform: 'uppercase' }}>AI Fibonacci Matrix</h4>
      {levels.map(l => (
        <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ color: '#94a3b8' }}>{l.label}</span>
          <span style={{ color: '#fff' }} className="mono">₹{l.val.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};
