import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA GOOGLE APPS SCRIPT WEB APP URL DALEIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwr3zsZWLK9JQ8ca6HMYfCVcugFKkLA6XdtUOza4Opi1uFOLo-z1F1PK4rxIrVIE8Mu4w/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    const local = localStorage.getItem('pro_terminal_backup');
    if (local) {
      const parsed = JSON.parse(local);
      return initialETFs.map(base => {
        const match = parsed.find((p: ETF) => p.id === base.id);
        // Allow strings to ensure decimal typing works perfectly
        return match ? { ...base, holdings: match.holdings ?? '', avgBuyPrice: match.avgBuyPrice ?? '' } : base;
      });
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF | null>(etfs[0] || null);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // --- PRO CLOUD SYNC ENGINE (Runs only when forced) ---
  const savePortfolio = useCallback(async (newData: ETF[]) => {
    localStorage.setItem('pro_terminal_backup', JSON.stringify(newData)); // Instant Local
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbwr3zsZWLK9JQ8ca6HMYfCVcugFKkLA6XdtUOza4Opi1uFOLo-z1F1PK4rxIrVIE8Mu4w/exec') {
      setSyncStatus('syncing');
      try {
        const payload = newData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice }));
        
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        setTimeout(() => setSyncStatus('synced'), 500); 
      } catch (e) {
        console.error("Cloud Error", e);
        setSyncStatus('error');
      }
    }
  }, []);

  // Initial Load from Cloud
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
            return match ? { ...etf, holdings: match[2] ?? '', avgBuyPrice: match[3] ?? '' } : etf;
          }));
        }
        setSyncStatus('synced');
      } catch (e) { setSyncStatus('error'); }
    };
    loadCloud();
  }, []);

  // --- OPTIMIZED PRICE ENGINE (4 Sec tick to prevent React lag) ---
  useEffect(() => {
    if (etfs.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
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
    }, 4000); 
    return () => clearInterval(interval);
  }, [etfs]);

  // Actions: Sirf Local State Update karta hai (0 Lag)
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    setEtfs(prev => prev.map(e => e.id === id ? { ...e, holdings: qty, avgBuyPrice: avgPrice } : e));
  }, []);

  const forceSave = useCallback(() => savePortfolio(etfs), [etfs, savePortfolio]);

  const addAsset = useCallback((newAsset: ETF) => {
    const newData = [...etfs, newAsset];
    setEtfs(newData);
    savePortfolio(newData);
  }, [etfs, savePortfolio]);

  const deleteAsset = useCallback((id: string) => {
    const newData = etfs.filter(e => e.id !== id);
    setEtfs(newData);
    savePortfolio(newData);
  }, [etfs, savePortfolio]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, syncStatus };
}
