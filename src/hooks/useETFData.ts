import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA NAYA GOOGLE APPS SCRIPT WEB APP URL DALEIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxUE9jahTwsHRd26Bh2hDnjNkiYf9ry5MkdJcV9FL9kGHzOaEU6sjUPv20ZdBd7qnS8Yg/exec';

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

  // --- 1. PRO CLOUD SYNC (CORS BYPASS METHOD) ---
  const savePortfolio = useCallback(async (newData: ETF[]) => {
    localStorage.setItem('pro_terminal_backup', JSON.stringify(newData)); 
    setEtfs(newData);
    
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbxUE9jahTwsHRd26Bh2hDnjNkiYf9ry5MkdJcV9FL9kGHzOaEU6sjUPv20ZdBd7qnS8Yg/exec') {
      setSyncStatus('syncing');
      try {
        const payload = newData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice }));
        
        // 🚨 MAGIC FIX: Sending as 'text/plain' completely bypasses the browser's CORS block!
        const response = await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (e) {
        console.error("Cloud Save Error (CORS or Network):", e);
        setSyncStatus('error');
      }
    }
  }, []);

  // Initial Cloud Load
  useEffect(() => {
    const loadCloud = async () => {
      if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbxUE9jahTwsHRd26Bh2hDnjNkiYf9ry5MkdJcV9FL9kGHzOaEU6sjUPv20ZdBd7qnS8Yg/exec') return;
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

  // --- 3. SMART PROXY ROTATOR FOR ULTRA-FAST PRICES (Anti-Ban) ---
  useEffect(() => {
    if (etfs.length === 0) return;

    const fetchLivePrice = async (symbol: string, market: string) => {
      const yfSymbol = market === 'IN' ? `${symbol}.NS` : symbol;
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m`;
      
      // Smart Proxy Array (Agar ek API block kare, toh dusri chalegi)
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl + '&_t=' + Date.now())}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${targetUrl}`
      ];

      for (const proxy of proxies) {
        try {
          const res = await fetch(proxy);
          if (!res.ok) continue; // Try next proxy
          const data = await res.json();
          if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
            return data.chart.result[0].meta.regularMarketPrice;
          }
        } catch (e) { continue; } // Silent fail, loop to next
      }
      return null; // Sab fail ho gaye (No internet or heavy block)
    };

    // Polling interval 6 seconds (Best balance for real-time feel and preventing API bans)
    const interval = setInterval(async () => {
      const updatedEtfs = await Promise.all(etfs.map(async (etf) => {
        const currentPrice = await fetchLivePrice(etf.symbol, etf.market);
        
        if (currentPrice && currentPrice !== etf.price) {
          if (currentPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (currentPrice < etf.price) flashMap.current.set(etf.id, 'down');
          
          return { ...etf, price: currentPrice, prevPrice: etf.price };
        }
        return etf; 
      }));

      setEtfs(updatedEtfs);
      setTimeout(() => flashMap.current.clear(), 600); 
    }, 6000); 

    return () => clearInterval(interval);
  }, [etfs]);

  // --- 4. ACTIONS ---
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    setEtfs(prev => prev.map(e => e.id === id ? { ...e, holdings: qty, avgBuyPrice: avgPrice } : e));
  }, []);

  const forceSave = useCallback(() => savePortfolio(etfs), [etfs, savePortfolio]);
  
  const addAsset = useCallback((newAsset: ETF) => savePortfolio([...etfs, newAsset]), [etfs, savePortfolio]);
  const deleteAsset = useCallback((id: string) => savePortfolio(etfs.filter(e => e.id !== id)), [etfs, savePortfolio]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, syncStatus };
}
