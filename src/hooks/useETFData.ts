import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxKqjE-RL79dV95K1b4lGD-uwi-ZknMTHr9icYTJlvZuOb8h5USUI_UGG87nMpxUq_T5g/exec';

export function useETFData() {
  // 1. Initial Load: Always try LocalStorage first (Fastest & Safest)
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    try {
      const localData = localStorage.getItem('smartai_portfolio_v2');
      if (localData) {
        const parsed = JSON.parse(localData);
        // Merge with initial structure to ensure no missing fields
        return initialETFs.map(baseEtf => {
          const match = parsed.find((p: ETF) => p.id === baseEtf.id);
          return match ? { ...baseEtf, holdings: match.holdings || 0, avgBuyPrice: match.avgBuyPrice || 0 } : baseEtf;
        });
      }
    } catch (e) { console.error("Local Load Error", e); }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF | null>(etfs[0] || null);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [isSyncing, setIsSyncing] = useState(false);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // 2. Hybrid Save: Save Local instantly, then push to Cloud
  const savePortfolio = useCallback(async (newData: ETF[]) => {
    setEtfs(newData);
    localStorage.setItem('smartai_portfolio_v2', JSON.stringify(newData)); // 100% Safe Local Backup
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbxKqjE-RL79dV95K1b4lGD-uwi-ZknMTHr9icYTJlvZuOb8h5USUI_UGG87nMpxUq_T5g/exec') {
      setIsSyncing(true);
      try {
        const payload = newData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice }));
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // CORS bypass
          body: JSON.stringify(payload)
        });
      } catch (e) { console.error("Cloud Save Failed, but Local is safe."); }
      setIsSyncing(false);
    }
  }, []);

  // 3. Live Price Fetching (With Fallback)
  useEffect(() => {
    if (etfs.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&_t=${Date.now()}`)}`);
          if (!res.ok) throw new Error('API Rate Limit');
          const data = await res.json();
          const price = data.chart.result[0].meta.regularMarketPrice;
          
          if (price > etf.price) flashMap.current.set(etf.id, 'up');
          else if (price < etf.price) flashMap.current.set(etf.id, 'down');
          
          return { ...etf, price, prevPrice: etf.price };
        } catch { return etf; } // Maintain old price if API fails
      }));
      setEtfs(updated);
      setTimeout(() => flashMap.current.clear(), 300);
    }, 8000); // 8 Sec optimization to prevent lag
    return () => clearInterval(interval);
  }, [etfs]);

  // Actions
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    const newData = etfs.map(e => e.id === id ? { ...e, holdings: Number(qty) || 0, avgBuyPrice: Number(avgPrice) || 0 } : e);
    savePortfolio(newData);
  }, [etfs, savePortfolio]);

  const addAsset = useCallback((newAsset: ETF) => savePortfolio([...etfs, newAsset]), [etfs, savePortfolio]);
  const deleteAsset = useCallback((id: string) => savePortfolio(etfs.filter(e => e.id !== id)), [etfs, savePortfolio]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave: () => savePortfolio(etfs), isSyncing };
}
