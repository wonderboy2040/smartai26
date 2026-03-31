import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

// IS URL KO APNE DEPLOYED APPS SCRIPT URL SE REPLACE KAREIN
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyaZVFHnDgSmUfSorjuDnSCzR2VOxUObmUrkV3g0x5XZJBDpEk4wsiyJFbjoCs3RQpr6Q/exec';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(initialETFs);
  const [selectedETF, setSelectedETF] = useState<ETF | null>(etfs[0]);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const [isSyncing, setIsSyncing] = useState(false);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // --- CLOUD SYNC LOGIC ---
  const fetchFromCloud = useCallback(async () => {
    if (GOOGLE_SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') return;
    setIsSyncing(true);
    try {
      const res = await fetch(GOOGLE_SHEET_URL);
      const cloudData = await res.json();
      // Map cloud data back to initialETFs structure
      const updated = etfs.map(etf => {
        const match = cloudData.find((row: any) => row[1] === etf.symbol);
        return match ? { ...etf, holdings: match[2], avgBuyPrice: match[3] } : etf;
      });
      setEtfs(updated);
    } catch (e) { console.error("Cloud Sync Error", e); }
    setIsSyncing(false);
  }, [etfs]);

  const saveToCloud = useCallback(async (currentData: ETF[]) => {
    if (GOOGLE_SHEET_URL === 'https://script.google.com/macros/s/AKfycbyaZVFHnDgSmUfSorjuDnSCzR2VOxUObmUrkV3g0x5XZJBDpEk4wsiyJFbjoCs3RQpr6Q/exec') return;
    setIsSyncing(true);
    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(currentData.map(e => ({ id: e.id, symbol: e.symbol, holdings: e.holdings, avgBuyPrice: e.avgBuyPrice })))
      });
    } catch (e) { console.error("Cloud Save Error", e); }
    setIsSyncing(false);
  }, []);

  useEffect(() => { fetchFromCloud(); }, []);

  // --- PRICE FETCHING (ALREADY OPTIMIZED) ---
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await Promise.all(etfs.map(async (etf) => {
        try {
          const yf = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yf}?interval=1m`)}`;
          const res = await fetch(url);
          const data = await res.json();
          const price = data.chart.result[0].meta.regularMarketPrice;
          if (price > etf.price) flashMap.current.set(etf.id, 'up');
          else if (price < etf.price) flashMap.current.set(etf.id, 'down');
          return { ...etf, price };
        } catch { return etf; }
      }));
      setEtfs(updated);
    }, 10000);
    return () => clearInterval(interval);
  }, [etfs]);

  const updateAssetDetails = (id: string, qty: string, avg: string) => {
    const newData = etfs.map(e => e.id === id ? { ...e, holdings: qty, avgBuyPrice: avg } : e);
    setEtfs(newData);
    saveToCloud(newData); // Auto-sync to Google Sheets
  };

  return { etfs, selectedETF, selectETF: setSelectedETF, getFlash: (id: string) => flashMap.current.get(id), usdInrRate, updateAssetDetails, isSyncing };
}
