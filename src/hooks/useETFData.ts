import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    try {
      const saved = localStorage.getItem('smartai_portfolio_sync');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved holdings and avg prices with initial structure
        return parsed.map((savedEtf: ETF) => ({
          ...savedEtf,
          holdings: savedEtf.holdings || 0,
          avgBuyPrice: savedEtf.avgBuyPrice || 0
        }));
      }
    } catch (e) {
      console.error("Sync error", e);
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF>(etfs[0] || initialETFs[0]);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // Auto-Sync
  useEffect(() => {
    localStorage.setItem('smartai_portfolio_sync', JSON.stringify(etfs));
  }, [etfs]);

  // Live Exchange Rate
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

  // Advanced Price Fetching Mechanism (Real API with Smart Fallback)
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (etfs.length === 0) return;

      const updatedEtfs = await Promise.all(etfs.map(async (etf) => {
        try {
          const yfSymbol = etf.market === 'IN' ? `${etf.symbol}.NS` : etf.symbol;
          const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m`)}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error('API Rate Limit or Network Error');
          const data = await response.json();
          
          const result = data.chart.result[0];
          const currentPrice = result.meta.regularMarketPrice;
          const previousClose = result.meta.chartPreviousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          if (currentPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (currentPrice < etf.price) flashMap.current.set(etf.id, 'down');

          return { ...etf, price: currentPrice, prevPrice: etf.price, change: change, changePercent: changePercent };
        } catch (error) {
          // Smart Fallback Simulator
          const volatility = etf.market === 'US' ? 0.05 : 0.2; 
          const priceChange = (Math.random() - 0.48) * volatility;
          const newPrice = +(etf.price + priceChange).toFixed(2);
          
          if (newPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (newPrice < etf.price) flashMap.current.set(etf.id, 'down');

          return { ...etf, prevPrice: etf.price, price: newPrice };
        }
      }));

      setEtfs(updatedEtfs);
      setTimeout(() => flashMap.current.clear(), 300); 
    };

    const interval = setInterval(fetchLivePrices, 5000);
    return () => clearInterval(interval);
  }, [etfs]); 

  useEffect(() => {
    if (etfs.length > 0) {
      const updated = etfs.find(e => e.id === selectedETF?.id);
      if (updated) setSelectedETF(updated);
      else setSelectedETF(etfs[0]);
    }
  }, [etfs, selectedETF?.id]);

  const selectETF = useCallback((etf: ETF) => setSelectedETF(etf), []);
  const getFlash = useCallback((id: string) => flashMap.current.get(id), []);
  
  // NEW: Update Qty AND Avg Price together
  const updateAssetDetails = useCallback((id: string, qty: string, avgPrice: string) => {
    setEtfs(prev => prev.map(etf => etf.id === id ? { 
      ...etf, 
      holdings: Number(qty) || 0,
      avgBuyPrice: Number(avgPrice) || 0 
    } : etf));
  }, []);

  const addAsset = useCallback((newAsset: ETF) => {
    setEtfs(prev => [...prev, newAsset]);
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setEtfs(prev => prev.filter(etf => etf.id !== id));
  }, []);

  // Force manual save (for UI feedback)
  const forceSave = useCallback(() => {
    localStorage.setItem('smartai_portfolio_sync', JSON.stringify(etfs));
  }, [etfs]);

  return { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave };
}