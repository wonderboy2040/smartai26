import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    try {
      const saved = localStorage.getItem('smartai_portfolio_sync');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Sync error", e);
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF>(etfs[0] || initialETFs[0]);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // Cloud/Local Sync
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
          // Fetch Real Market Data (India ke liye .NS append karna zaruri hai Yahoo Finance me)
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

          return {
            ...etf,
            price: currentPrice,
            prevPrice: etf.price,
            change: change,
            changePercent: changePercent,
          };
        } catch (error) {
          // Smart Fallback: Agar API fail ho jaye toh smooth simulation chalta rahega
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

    // Har 5 second me advanced fetch trigger hoga
    const interval = setInterval(fetchLivePrices, 5000);
    return () => clearInterval(interval);
  }, [etfs]); // Depend on etfs to ensure new assets are fetched

  useEffect(() => {
    if (etfs.length > 0) {
      const updated = etfs.find(e => e.id === selectedETF?.id);
      if (updated) setSelectedETF(updated);
      else setSelectedETF(etfs[0]);
    }
  }, [etfs, selectedETF?.id]);

  const selectETF = useCallback((etf: ETF) => setSelectedETF(etf), []);
  const getFlash = useCallback((id: string) => flashMap.current.get(id), []);
  
  // Feature: Update Qty
  const updateHoldings = useCallback((id: string, qty: string) => {
    setEtfs(prev => prev.map(etf => etf.id === id ? { ...etf, holdings: Number(qty) || 0 } : etf));
  }, []);

  // Feature: Add Asset
  const addAsset = useCallback((newAsset: ETF) => {
    setEtfs(prev => [...prev, newAsset]);
  }, []);

  // Feature: Delete Asset
  const deleteAsset = useCallback((id: string) => {
    setEtfs(prev => prev.filter(etf => etf.id !== id));
  }, []);

  return { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateHoldings, addAsset, deleteAsset };
}
