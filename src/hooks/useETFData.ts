import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA NAYA GOOGLE APPS SCRIPT WEB APP URL PASTE KAREIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    const local = localStorage.getItem('pro_terminal_backup');
    if (local) {
      const parsed = JSON.parse(local);
      return initialETFs.map(base => {
        const match = parsed.find((p: ETF) => p.id === base.id);
        // Allowing strings to keep decimal typing smooth and lag-free
        return match ? { ...base, holdings: match.holdings ?? '', avgBuyPrice: match.avgBuyPrice ?? '' } : base;
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
    localStorage.setItem('pro_terminal_backup', JSON.stringify(newData)); 
    setEtfs(newData);
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec') {
      setSyncStatus('syncing');
      try {
        const payload = newData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice }));
        
        // mode 'no-cors' forces browser to send data without preflight block
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        
        setTimeout(() => setSyncStatus('synced'), 800); 
      } catch (e) {
        console.error("Cloud Error", e);
        setSyncStatus('error');
      }
    }
  }, []);

  // Initial Cloud Load
  useEffect(() => {
    const loadCloud = async () => {
      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbwHFvVybQOjaIp8Dq1QOK4Y404_Ai4ppJTNRhzssHXbtu6pqUIU_UeD3bSSU0tZQB02mA/exec') return;
      setSyncStatus('syncing');
      try {
        const res = await fetch(GOOGLE_SHEET_URL);
        const data = await res.json();
        if (data && data.length > 1) { // Skip headers
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

  // USD/INR Exchange Rate Fetch
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
          setUsdInrRate(data.rates.INR);
        }
      } catch (error) {
        console.error("Live USD/INR Fetch Error:", error);
      }
    };
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 1800000); 
    return () => clearInterval(interval);
  }, []);

  // --- ULTRA-FAST PRICE ENGINE (3s Tick via Yahoo Finance Proxy) ---
  useEffect(() => {
    if (etfs.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          // _t=${Date.now()} bypasses cache for raw real-time data
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
    }, 3000); // 3 Second refresh interval
    return () => clearInterval(interval);
  }, [etfs]);

  // Actions
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    setEtfs(prev => prev.map(e => e.id === id ? { ...e, holdings: qty, avgBuyPrice: avgPrice } : e));
  }, []);

  const forceSave = useCallback(() => savePortfolio(etfs), [etfs, savePortfolio]);
  const addAsset = useCallback((newAsset: ETF) => savePortfolio([...etfs, newAsset]), [etfs, savePortfolio]);
  const deleteAsset = useCallback((id: string) => savePortfolio(etfs.filter(e => e.id !== id)), [etfs, savePortfolio]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, syncStatus };
}
