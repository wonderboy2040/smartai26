import { ETF } from '../types';
import { useState } from 'react';

export const AIPlanner = ({ etfs, usdInrRate }: { etfs: ETF[], usdInrRate: number }) => {
  const [wallet, setWallet] = useState<number>(100000);

  const planning = etfs.filter(e => e.signal === 'BUY').map(etf => {
    const allocation = wallet * 0.15; // 15% per strong asset
    const priceInINR = etf.market === 'US' ? etf.price * usdInrRate : etf.price;
    const qty = (allocation / priceInINR).toFixed(4);
    return { ...etf, buyQty: qty, investAmt: allocation };
  });

  return (
    <div style={{ background: 'rgba(15,20,35,0.9)', padding: '20px', borderRadius: '16px', border: '1px solid #8b5cf6' }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>🚀 AI Portfolio Planner</h3>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#94a3b8', fontSize: '12px' }}>Total Investment Wallet (INR)</label>
        <input type="number" value={wallet} onChange={(e) => setWallet(Number(e.target.value))} style={{ width: '100%', background: '#000', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '8px' }} />
      </div>
      {planning.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{p.symbol}</span>
          <span style={{ color: '#22c55e' }}>Buy {p.buyQty} Qty @ ₹{(p.market === 'US' ? p.price * usdInrRate : p.price).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};
