import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// 👇 YAHAN APNA NAYA GOOGLE APPS SCRIPT URL PASTE KAREIN 👇
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxKqjE-RL79dV95K1b4lGD-uwi-ZknMTHr9icYTJlvZuOb8h5USUI_UGG87nMpxUq_T5g/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(initialETFs);
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null); // Initial null to avoid crash
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [isSyncing, setIsSyncing] = useState(false);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // --- CLOUD GET (Fetch data from Google Sheets) ---
  const fetchFromCloud = useCallback(async () => {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbxKqjE-RL79dV95K1b4lGD-uwi-ZknMTHr9icYTJlvZuOb8h5USUI_UGG87nMpxUq_T5g/exec') return;
    setIsSyncing(true);
    try {
      const res = await fetch(GOOGLE_SHEET_URL);
      const cloudData = await res.json();
      
      // Map cloud data back to initialETFs structure (Skip header row 0)
      if (cloudData && cloudData.length > 1) {
        const updated = initialETFs.map(etf => {
          const match = cloudData.find((row: any[]) => row[1] === etf.symbol);
          return match ? { ...etf, holdings: match[2] || 0, avgBuyPrice: match[3] || 0 } : etf;
        });
        setEtfs(updated);
        setSelectedETF(updated[0]); // Set first ETF after load
      } else {
        setEtfs(initialETFs);
        setSelectedETF(initialETFs[0]);
      }
    } catch (e) { 
      console.error("Cloud Sync Error (GET):", e); 
      setEtfs(initialETFs);
      setSelectedETF(initialETFs[0]);
    }
    setIsSyncing(false);
  }, []);

  // --- CLOUD POST (Save data to Google Sheets) ---
  const saveToCloud = useCallback(async (currentData: ETF[]) => {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbxKqjE-RL79dV95K1b4lGD-uwi-ZknMTHr9icYTJlvZuOb8h5USUI_UGG87nMpxUq_T5g/exec') return;
    setIsSyncing(true);
    try {
      // Create payload matching Google Sheets Columns
      const payload = currentData.map(e => ({ 
        id: e.id, 
        symbol: e.symbol, 
        holdings: e.holdings, 
        avgBuyPrice: e.avgBuyPrice 
      }));

      // CORS Bypass technique for Google Sheets (use text/plain)
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
    } catch (e) { 
      console.error("Cloud Save Error (POST):", e); 
    }
    setIsSyncing(false);
  }, []);

  // On App Load: Fetch from Cloud
  useEffect(() => { 
    fetchFromCloud(); 
  }, [fetchFromCloud]);

  // Live Exchange Rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data?.rates?.INR) setUsdInrRate(data.rates.INR);
      } catch (error) { console.error("Live USD/INR Fetch Error:", error); }
    };
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 1800000); 
    return () => clearInterval(interval);
  }, []);

  // Live Price Fetching (Ultra Fast via Proxy)
  useEffect(() => {
    if (etfs.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&_t=${Date.now()}`)}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error('API Rate Limit');
          const data = await response.json();
          
          const result = data.chart.result[0];
          const currentPrice = result.meta.regularMarketPrice;
          const previousClose = result.meta.chartPreviousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          if (currentPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (currentPrice < etf.price) flashMap.current.set(etf.id, 'down');

          return { ...etf, price: currentPrice, prevPrice: etf.price, change, changePercent };
        } catch {
          // Fallback simulation if API rate limits
          return etf;
        }
      }));
      setEtfs(updated);
      setTimeout(() => flashMap.current.clear(), 300);
    }, 5000); // 5 sec update
    return () => clearInterval(interval);
  }, [etfs]);

  // Actions
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    const newData = etfs.map(e => e.id === id ? { ...e, holdings: Number(qty) || 0, avgBuyPrice: Number(avgPrice) || 0 } : e);
    setEtfs(newData);
    saveToCloud(newData); // Automatically pushes to Google Sheet when you type
  }, [etfs, saveToCloud]);

  const addAsset = useCallback((newAsset: ETF) => {
    const newData = [...etfs, newAsset];
    setEtfs(newData);
    saveToCloud(newData);
  }, [etfs, saveToCloud]);

  const deleteAsset = useCallback((id: string) => {
    const newData = etfs.filter(etf => etf.id !== id);
    setEtfs(newData);
    saveToCloud(newData);
  }, [etfs, saveToCloud]);

  const forceSave = useCallback(() => {
    saveToCloud(etfs);
  }, [etfs, saveToCloud]);

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, isSyncing };
}
