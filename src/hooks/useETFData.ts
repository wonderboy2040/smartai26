import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA GOOGLE APPS SCRIPT WEB APP URL DALEIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    const local = localStorage.getItem('pro_terminal_backup');
    if (local) {
      const parsed = JSON.parse(local);
      return initialETFs.map(base => {
        const match = parsed.find((p: ETF) => p.id === base.id);
        return match ? { ...base, holdings: match.holdings ?? '', avgBuyPrice: match.avgBuyPrice ?? '' } : base;
      });
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF | null>(etfs[0] || null);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // --- 1. PRO CLOUD SYNC ENGINE (No-CORS) ---
  const savePortfolio = useCallback(async (newData: ETF[]) => {
    localStorage.setItem('pro_terminal_backup', JSON.stringify(newData)); 
    setEtfs(newData);
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec') {
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
        console.error("Cloud Save Error", e);
        setSyncStatus('error');
      }
    }
  }, []);

  // Initial Load from Cloud
  useEffect(() => {
    const loadCloud = async () => {
      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec') return;
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

  // --- 2. USD/INR LIVE FETCHER ---
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data?.rates?.INR) setUsdInrRate(data.rates.INR);
      } catch (error) { console.error("Live USD/INR Error"); }
    };
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 1800000); 
    return () => clearInterval(interval);
  }, []);

  // --- 3. MULTI-PROXY ULTRA-FAST PRICE ENGINE ---
  useEffect(() => {
    if (etfs.length === 0) return;

    // Helper to fetch price with fallback proxies to bypass rate limits
    const fetchLivePrice = async (symbol: string, market: string) => {
      const yfSymbol = market === 'IN' ? `${symbol}.NS` : symbol;
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&_t=${Date.now()}`;
      
      // Proxy Rotation (If one fails, try next automatically)
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
      ];

      for (const proxy of proxies) {
        try {
          const res = await fetch(proxy);
          if (!res.ok) continue;
          const data = await res.json();
          return data.chart.result[0].meta.regularMarketPrice;
        } catch (e) { continue; } // Silent fail, try next proxy
      }
      return null; // Both failed
    };

    const interval = setInterval(async () => {
      const updatedEtfs = await Promise.all(etfs.map(async (etf) => {
        const currentPrice = await fetchLivePrice(etf.symbol, etf.market);
        
        if (currentPrice && currentPrice !== etf.price) {
          if (currentPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (currentPrice < etf.price) flashMap.current.set(etf.id, 'down');
          
          return { ...etf, price: currentPrice, prevPrice: etf.price };
        }
        return etf; // Return old data if fetch failed
      }));

      setEtfs(updatedEtfs);
      
      // Clear WSS tick flash effect smoothly
      setTimeout(() => flashMap.current.clear(), 400); 
    }, 4000); // 4 Seconds is the sweet spot to avoid getting IP blocked while feeling realtime

    return () => clearInterval(interval);
  }, [etfs]);

  // --- 4. ACTIONS (Zero Lag Typing) ---
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    setEtfs(prev => prev.map(e => e.id === id ? { ...e, holdings: qty, avgBuyPrice: avgPrice } : e));
  }, []);

  const forceSave = useCallback(() => savePortfolio(etfs), [etfs, savePortfolio]);
  
  const addAsset = useCallback((newAsset: ETF) => {
    savePortfolio([...etfs, newAsset]);
  }, [etfs, savePortfolio]);
  
  const deleteAsset = useCallback((id: string) => {
    savePortfolio(etfs.filter(e => e.id !== id));
  }, [etfs, savePortfolio]);

  return { 
    etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), 
    usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, syncStatus 
  };
}
