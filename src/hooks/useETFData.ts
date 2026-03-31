import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA NAYA GOOGLE APPS SCRIPT WEB APP URL PASTE KAREIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwr3zsZWLK9JQ8ca6HMYfCVcugFKkLA6XdtUOza4Opi1uFOLo-z1F1PK4rxIrVIE8Mu4w/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    const local = localStorage.getItem('pro_terminal_backup');
    if (local) {
      const parsed = JSON.parse(local);
      return initialETFs.map(base => {
        const match = parsed.find((p: ETF) => p.id === base.id);
        return match ? { ...base, holdings: match.holdings || 0, avgBuyPrice: match.avgBuyPrice || 0 } : base;
      });
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF | null>(etfs[0] || null);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // --- PRO CLOUD SYNC (NO-CORS BYPASS) ---
  const savePortfolio = useCallback(async (newData: ETF[]) => {
    setEtfs(newData);
    localStorage.setItem('pro_terminal_backup', JSON.stringify(newData)); 
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbwr3zsZWLK9JQ8ca6HMYfCVcugFKkLA6XdtUOza4Opi1uFOLo-z1F1PK4rxIrVIE8Mu4w/exec') {
      setSyncStatus('syncing');
      try {
        const payload = newData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice }));
        
        // MAGIC FIX: mode 'no-cors' forces browser to send data without preflight block
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        // no-cors returns opaque response, so we assume success if no JS error
        setTimeout(() => setSyncStatus('synced'), 500); 
      } catch (e) {
        console.error("Cloud Error", e);
        setSyncStatus('error');
      }
    }
  }, []);

  // Initial Cloud Load
  useEffect(() => {
    const loadCloud = async () => {
      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbwr3zsZWLK9JQ8ca6HMYfCVcugFKkLA6XdtUOza4Opi1uFOLo-z1F1PK4rxIrVIE8Mu4w/exec') return;
      setSyncStatus('syncing');
      try {
        const res = await fetch(GOOGLE_SHEET_URL);
        const data = await res.json();
        if (data && data.length > 1) {
          setEtfs(prev => prev.map(etf => {
            const match = data.find((row: any[]) => row[1] === etf.symbol);
            return match ? { ...etf, holdings: match[2] || 0, avgBuyPrice: match[3] || 0 } : etf;
          }));
        }
        setSyncStatus('synced');
      } catch (e) { setSyncStatus('error'); }
    };
    loadCloud();
  }, []);

  // --- ULTRA-FAST PRICE ENGINE (2s Tick Simulation) ---
  useEffect(() => {
    if (etfs.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          // _t=${Date.now()} bypasses all caches to give you raw real-time data
          const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&_t=${Date.now()}`)}`;
          const res = await fetch(url);
          const data = await res.json();
          const price = data.chart.result[0].meta.regularMarketPrice;
          
          if (price > etf.price) flashMap.current.set(etf.id, 'up');
          else if (price < etf.price) flashMap.current.set(etf.id, 'down');
          
          return { ...etf, price, prevPrice: etf.price };
        } catch { return etf; }
      }));
      setEtfs(updated);
      setTimeout(() => flashMap.current.clear(), 300);
    }, 2500); // Ultra-fast 2.5 seconds refresh
    return () => clearInterval(interval);
  }, [etfs]);

  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    savePortfolio(etfs.map(e => e.id === id ? { ...e, holdings: Number(qty) || 0, avgBuyPrice: Number(avgPrice) || 0 } : e));
  }, [etfs, savePortfolio]);

  const addAsset = useCallback((newAsset: ETF) => savePortfolio([...etfs, newAsset]), [etfs, savePortfolio]);
  const deleteAsset = useCallback((id: string) => savePortfolio(etfs.filter(e => e.id !== id)), [etfs, savePortfolio]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, syncStatus };
}
