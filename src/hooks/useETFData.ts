import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

export function useETFData() {
  // Sync logic: Fetch saved portfolio directly on load
  const [etfs, setEtfs] = useState<ETF[]>(() => {
    const saved = localStorage.getItem('smartai_portfolio_sync');
    if (saved) {
      const parsed = JSON.parse(saved);
      return initialETFs.map(etf => {
        const savedETF = parsed.find((p: ETF) => p.id === etf.id);
        return savedETF ? { ...etf, holdings: savedETF.holdings } : etf;
      });
    }
    return initialETFs;
  });

  const [selectedETF, setSelectedETF] = useState<ETF>(etfs[0]);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50);
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // Auto-Sync across tabs / mobile app logic (Local Storage)
  useEffect(() => {
    localStorage.setItem('smartai_portfolio_sync', JSON.stringify(etfs));
  }, [etfs]);

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

  // Ultra-Fast Live Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setEtfs(prevEtfs => 
        prevEtfs.map(etf => {
          const volatility = etf.market === 'US' ? 0.05 : 0.2; 
          const priceChange = (Math.random() - 0.48) * volatility;
          const newPrice = +(etf.price + priceChange).toFixed(2);
          
          if (newPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (newPrice < etf.price) flashMap.current.set(etf.id, 'down');

          return { ...etf, prevPrice: etf.price, price: newPrice };
        })
      );
      setTimeout(() => flashMap.current.clear(), 300); 
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updated = etfs.find(e => e.id === selectedETF.id);
    if (updated) setSelectedETF(updated);
  }, [etfs, selectedETF.id]);

  const selectETF = useCallback((etf: ETF) => setSelectedETF(etf), []);
  const getFlash = useCallback((id: string) => flashMap.current.get(id), []);
  
  // Naya function: Qty update ke liye (fractional digits allow karega)
  const updateHoldings = useCallback((id: string, qty: number | string) => {
    setEtfs(prev => prev.map(etf => etf.id === id ? { ...etf, holdings: Number(qty) || 0 } : etf));
  }, []);

  return { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateHoldings };
}
