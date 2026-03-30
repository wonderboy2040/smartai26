import { useState, useEffect, useCallback, useRef } from 'react';
import { ETF } from '../types';
import { initialETFs } from '../data';

export function useETFData() {
  const [etfs, setEtfs] = useState<ETF[]>(initialETFs);
  const [selectedETF, setSelectedETF] = useState<ETF>(initialETFs[0]);
  const [usdInrRate, setUsdInrRate] = useState<number>(83.50); // Default fallback rate
  const flashMap = useRef<Map<string, 'up' | 'down'>>(new Map());

  // 1. Fetch Live 24x7 USD/INR Exchange Rate
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
    // Har 30 minute me conversion rate refresh hoga
    const interval = setInterval(fetchExchangeRate, 1800000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Ultra-Fast Live Price Simulation (Market Open/Close ke hisaab se smooth transition)
  useEffect(() => {
    const interval = setInterval(() => {
      setEtfs(prevEtfs => 
        prevEtfs.map(etf => {
          // Market volatility set karna
          const volatility = etf.market === 'US' ? 0.05 : 0.2; 
          const priceChange = (Math.random() - 0.48) * volatility;
          const newPrice = +(etf.price + priceChange).toFixed(2);
          
          if (newPrice > etf.price) flashMap.current.set(etf.id, 'up');
          else if (newPrice < etf.price) flashMap.current.set(etf.id, 'down');

          return { ...etf, prevPrice: etf.price, price: newPrice };
        })
      );

      // Flash ko jaldi clear karein for smooth lag-free UI
      setTimeout(() => flashMap.current.clear(), 300); 
    }, 1500); // 1.5 second ka ultra-fast update rate

    return () => clearInterval(interval);
  }, []);

  // Selected ETF sync
  useEffect(() => {
    const updated = etfs.find(e => e.id === selectedETF.id);
    if (updated) setSelectedETF(updated);
  }, [etfs, selectedETF.id]);

  const selectETF = useCallback((etf: ETF) => setSelectedETF(etf), []);
  const getFlash = useCallback((id: string) => flashMap.current.get(id), []);

  return { etfs, selectedETF, selectETF, getFlash, usdInrRate };
}