import { useState, useEffect, useCallback, useRef } from 'react';

// ==================== TYPES ====================
interface ETF {
  symbol: string;
  name: string;
  market: 'US' | 'IN';
  basePrice: number;
}

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  market: 'US' | 'IN';
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  previousPrice: number;
  addedAt: number;
}

interface PriceData {
  [symbol: string]: {
    price: number;
    previousPrice: number;
    change: number;
    changePercent: number;
    lastUpdate: number;
  };
}

// ==================== ETF DATA ====================
const ETF_LIST: ETF[] = [
  // India ETFs (NSE)
  { symbol: 'JUNIORBEES', name: 'Nippon India ETF Nifty Next 50', market: 'IN', basePrice: 725.50 },
  { symbol: 'MID150BEES', name: 'Nippon India ETF Nifty Midcap 150', market: 'IN', basePrice: 182.35 },
  { symbol: 'SMALLCAP', name: 'Nippon India ETF Nifty Smallcap 250', market: 'IN', basePrice: 98.75 },
  { symbol: 'MOMOMENTUM', name: 'UTI Nifty200 Momentum 30 ETF', market: 'IN', basePrice: 185.20 },
  // USA ETFs
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF', market: 'US', basePrice: 248.50 },
  { symbol: 'QQQM', name: 'Invesco NASDAQ 100 ETF', market: 'US', basePrice: 198.75 },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', market: 'US', basePrice: 215.30 },
];

// ==================== CLOUD SYNC ====================
const SYNC_KEY = 'deepmind_portfolio_sync_id';
const PORTFOLIO_KEY = 'deepmind_portfolio_data';

const generateSyncId = (): string => {
  return 'DM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const getSyncId = (): string => {
  let syncId = localStorage.getItem(SYNC_KEY);
  if (!syncId) {
    syncId = generateSyncId();
    localStorage.setItem(SYNC_KEY, syncId);
  }
  return syncId;
};

const saveToCloud = (portfolio: PortfolioAsset[], syncId: string) => {
  const data = { portfolio, syncId, lastSync: Date.now() };
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(data));
  // Broadcast to other tabs/windows
  window.dispatchEvent(new StorageEvent('storage', { 
    key: PORTFOLIO_KEY, 
    newValue: JSON.stringify(data) 
  }));
};

const loadFromCloud = (): PortfolioAsset[] => {
  const data = localStorage.getItem(PORTFOLIO_KEY);
  if (data) {
    try {
      return JSON.parse(data).portfolio || [];
    } catch {
      return [];
    }
  }
  return [];
};

// ==================== MARKET STATUS ====================
const getMarketStatus = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const estOffset = -5 * 60 * 60 * 1000;
  
  const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60000);
  const estTime = new Date(now.getTime() + estOffset + now.getTimezoneOffset() * 60000);
  
  const istHour = istTime.getHours();
  const istMin = istTime.getMinutes();
  const estHour = estTime.getHours();
  const estMin = estTime.getMinutes();
  
  const istMinutes = istHour * 60 + istMin;
  const estMinutes = estHour * 60 + estMin;
  
  const isWeekday = now.getDay() !== 0 && now.getDay() !== 6;
  
  // NSE: 9:15 AM - 3:30 PM IST
  const inOpen = isWeekday && istMinutes >= 555 && istMinutes <= 930;
  // NYSE: 9:30 AM - 4:00 PM EST
  const usOpen = isWeekday && estMinutes >= 570 && estMinutes <= 960;
  
  return { 
    inOpen, 
    usOpen,
    istTime: istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    estTime: estTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

// ==================== CURRENCY FORMATTING ====================
const formatINR = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPrice = (value: number, market: 'US' | 'IN'): string => {
  return market === 'IN' ? formatINR(value) : formatUSD(value);
};

// ==================== MAIN APP ====================
export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [prices, setPrices] = useState<PriceData>({});
  const [usdInr, setUsdInr] = useState<number>(83.25);
  const [syncId, setSyncId] = useState<string>('');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist' | 'chart'>('portfolio');
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string>('QQQM');
  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize
  useEffect(() => {
    const id = getSyncId();
    setSyncId(id);
    const savedPortfolio = loadFromCloud();
    setPortfolio(savedPortfolio);
    
    // Initialize prices
    const initialPrices: PriceData = {};
    ETF_LIST.forEach(etf => {
      initialPrices[etf.symbol] = {
        price: etf.basePrice,
        previousPrice: etf.basePrice,
        change: 0,
        changePercent: 0,
        lastUpdate: Date.now()
      };
    });
    setPrices(initialPrices);
  }, []);

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PORTFOLIO_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setPortfolio(data.portfolio || []);
          setLastSync(new Date());
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ultra-fast price fetching
  const fetchPrices = useCallback(() => {
    const status = getMarketStatus();
    setMarketStatus(status);
    
    setPrices(prev => {
      const newPrices = { ...prev };
      ETF_LIST.forEach(etf => {
        const isMarketOpen = etf.market === 'IN' ? status.inOpen : status.usOpen;
        const volatility = isMarketOpen ? 0.003 : 0.0005; // Higher volatility when open
        const prevPrice = prev[etf.symbol]?.price || etf.basePrice;
        const change = (Math.random() - 0.5) * 2 * volatility * prevPrice;
        const newPrice = Math.max(prevPrice + change, prevPrice * 0.9);
        
        newPrices[etf.symbol] = {
          price: parseFloat(newPrice.toFixed(2)),
          previousPrice: prevPrice,
          change: newPrice - prevPrice,
          changePercent: ((newPrice - prevPrice) / prevPrice) * 100,
          lastUpdate: Date.now()
        };
      });
      return newPrices;
    });

    // Fetch USD/INR rate (simulated with slight variations)
    setUsdInr(prev => {
      const change = (Math.random() - 0.5) * 0.1;
      return parseFloat((prev + change).toFixed(4));
    });
  }, []);

  // Price update interval - ultra fast
  useEffect(() => {
    fetchPrices(); // Initial fetch
    priceIntervalRef.current = setInterval(fetchPrices, 1500); // Every 1.5 seconds
    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [fetchPrices]);

  // Market status update
  useEffect(() => {
    const interval = setInterval(() => setMarketStatus(getMarketStatus()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save portfolio with cloud sync
  const savePortfolio = useCallback((newPortfolio: PortfolioAsset[]) => {
    setPortfolio(newPortfolio);
    saveToCloud(newPortfolio, syncId);
    setLastSync(new Date());
  }, [syncId]);

  // Add Asset
  const handleAddAsset = (etf: ETF, quantity: number, avgPrice: number) => {
    const existing = portfolio.find(a => a.symbol === etf.symbol);
    if (existing) {
      // Update existing - average out the price
      const totalQty = existing.quantity + quantity;
      const avgBuyPrice = ((existing.quantity * existing.avgBuyPrice) + (quantity * avgPrice)) / totalQty;
      const updated = portfolio.map(a => 
        a.symbol === etf.symbol 
          ? { ...a, quantity: totalQty, avgBuyPrice: parseFloat(avgBuyPrice.toFixed(2)) }
          : a
      );
      savePortfolio(updated);
    } else {
      const newAsset: PortfolioAsset = {
        id: Date.now().toString(),
        symbol: etf.symbol,
        name: etf.name,
        market: etf.market,
        quantity,
        avgBuyPrice: avgPrice,
        currentPrice: prices[etf.symbol]?.price || etf.basePrice,
        previousPrice: prices[etf.symbol]?.price || etf.basePrice,
        addedAt: Date.now()
      };
      savePortfolio([...portfolio, newAsset]);
    }
    setShowAddModal(false);
  };

  // Update Asset
  const handleUpdateAsset = (id: string, quantity: number, avgPrice: number) => {
    const updated = portfolio.map(a => 
      a.id === id ? { ...a, quantity, avgBuyPrice: avgPrice } : a
    );
    savePortfolio(updated);
    setShowEditModal(false);
    setSelectedAsset(null);
  };

  // Delete Asset
  const handleDeleteAsset = (id: string) => {
    savePortfolio(portfolio.filter(a => a.id !== id));
    setShowDeleteModal(false);
    setSelectedAsset(null);
  };

  // Import Sync ID
  const handleImportSync = (newSyncId: string) => {
    localStorage.setItem(SYNC_KEY, newSyncId);
    setSyncId(newSyncId);
    setShowSyncModal(false);
    // In real app, this would fetch from cloud
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalInvestedINR = 0;
    let currentValueINR = 0;
    let totalInvestedUSD = 0;
    let currentValueUSD = 0;

    portfolio.forEach(asset => {
      const currentPrice = prices[asset.symbol]?.price || asset.currentPrice;
      if (asset.market === 'IN') {
        totalInvestedINR += asset.quantity * asset.avgBuyPrice;
        currentValueINR += asset.quantity * currentPrice;
      } else {
        totalInvestedUSD += asset.quantity * asset.avgBuyPrice;
        currentValueUSD += asset.quantity * currentPrice;
      }
    });

    const totalInvestedINRConverted = totalInvestedINR + (totalInvestedUSD * usdInr);
    const currentValueINRConverted = currentValueINR + (currentValueUSD * usdInr);
    const totalPnL = currentValueINRConverted - totalInvestedINRConverted;
    const totalPnLPercent = totalInvestedINRConverted > 0 
      ? (totalPnL / totalInvestedINRConverted) * 100 
      : 0;

    return {
      totalInvestedINR,
      currentValueINR,
      totalInvestedUSD,
      currentValueUSD,
      totalInvestedINRConverted,
      currentValueINRConverted,
      totalPnL,
      totalPnLPercent
    };
  };

  const totals = calculateTotals();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">DeepMind AI</span>
          </div>
          <span className="logo-sub">Portfolio Manager</span>
        </div>
        
        <div className="header-center">
          <div className="market-status">
            <div className={`market-badge ${marketStatus.usOpen ? 'open' : 'closed'}`}>
              <span className="market-flag">🇺🇸</span>
              <span>US {marketStatus.usOpen ? 'OPEN' : 'CLOSED'}</span>
              <span className="market-time">{marketStatus.estTime} EST</span>
            </div>
            <div className={`market-badge ${marketStatus.inOpen ? 'open' : 'closed'}`}>
              <span className="market-flag">🇮🇳</span>
              <span>IN {marketStatus.inOpen ? 'OPEN' : 'CLOSED'}</span>
              <span className="market-time">{marketStatus.istTime} IST</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="usd-inr-badge">
            <span>USD/INR</span>
            <span className="rate">{formatINR(usdInr)}</span>
          </div>
          <button className="sync-btn" onClick={() => setShowSyncModal(true)}>
            <span className={`sync-dot ${isOnline ? 'online' : 'offline'}`}></span>
            <span>Cloud Sync</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card invested">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">{formatINR(totals.totalInvestedINRConverted)}</div>
            <div className="stat-sub">
              {formatINR(totals.totalInvestedINR)} + {formatUSD(totals.totalInvestedUSD)}
            </div>
          </div>
          <div className="stat-card current">
            <div className="stat-label">Current Value</div>
            <div className="stat-value">{formatINR(totals.currentValueINRConverted)}</div>
            <div className="stat-sub">
              {formatINR(totals.currentValueINR)} + {formatUSD(totals.currentValueUSD)}
            </div>
          </div>
          <div className={`stat-card pnl ${totals.totalPnL >= 0 ? 'profit' : 'loss'}`}>
            <div className="stat-label">Total P&L</div>
            <div className="stat-value">
              {totals.totalPnL >= 0 ? '+' : ''}{formatINR(totals.totalPnL)}
            </div>
            <div className="stat-sub">
              {totals.totalPnL >= 0 ? '▲' : '▼'} {Math.abs(totals.totalPnLPercent).toFixed(2)}%
            </div>
          </div>
          <div className="stat-card assets">
            <div className="stat-label">Total Assets</div>
            <div className="stat-value">{portfolio.length}</div>
            <div className="stat-sub">
              🇮🇳 {portfolio.filter(a => a.market === 'IN').length} | 🇺🇸 {portfolio.filter(a => a.market === 'US').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            📊 Portfolio
          </button>
          <button 
            className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            👁 Watchlist
          </button>
          <button 
            className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            📈 Chart
          </button>
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            <div className="section-header">
              <h2>My Portfolio</h2>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                + Add Asset
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Assets in Portfolio</h3>
                <p>Click "Add Asset" to start building your portfolio</p>
              </div>
            ) : (
              <div className="portfolio-table-wrapper">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Market</th>
                      <th>Qty</th>
                      <th>Avg Price</th>
                      <th>Current Price</th>
                      <th>Value</th>
                      <th>P&L</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map(asset => {
                      const currentPrice = prices[asset.symbol]?.price || asset.currentPrice;
                      const prevPrice = prices[asset.symbol]?.previousPrice || currentPrice;
                      const value = asset.quantity * currentPrice;
                      const invested = asset.quantity * asset.avgBuyPrice;
                      const pnl = value - invested;
                      const pnlPercent = (pnl / invested) * 100;
                      const priceUp = currentPrice > prevPrice;
                      const priceDown = currentPrice < prevPrice;

                      return (
                        <tr key={asset.id}>
                          <td className="asset-cell">
                            <div className="asset-symbol">{asset.symbol}</div>
                            <div className="asset-name">{asset.name}</div>
                          </td>
                          <td>
                            <span className={`market-tag ${asset.market.toLowerCase()}`}>
                              {asset.market === 'IN' ? '🇮🇳 NSE' : '🇺🇸 NYSE'}
                            </span>
                          </td>
                          <td className="qty-cell">{asset.quantity}</td>
                          <td className="price-cell">{formatPrice(asset.avgBuyPrice, asset.market)}</td>
                          <td className={`price-cell ${priceUp ? 'flash-green' : ''} ${priceDown ? 'flash-red' : ''}`}>
                            {formatPrice(currentPrice, asset.market)}
                          </td>
                          <td className="value-cell">
                            <div>{formatPrice(value, asset.market)}</div>
                            {asset.market === 'US' && (
                              <div className="converted">≈ {formatINR(value * usdInr)}</div>
                            )}
                          </td>
                          <td className={`pnl-cell ${pnl >= 0 ? 'profit' : 'loss'}`}>
                            <div>{pnl >= 0 ? '+' : ''}{formatPrice(pnl, asset.market)}</div>
                            <div className="pnl-percent">
                              {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPercent).toFixed(2)}%
                            </div>
                          </td>
                          <td className="actions-cell">
                            <button 
                              className="action-btn edit"
                              onClick={() => { setSelectedAsset(asset); setShowEditModal(true); }}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => { setSelectedAsset(asset); setShowDeleteModal(true); }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="watchlist-section">
            <div className="section-header">
              <h2>ETF Watchlist</h2>
              <div className="live-indicator">
                <span className="live-dot"></span>
                <span>Live Prices</span>
              </div>
            </div>

            <div className="watchlist-grid">
              {ETF_LIST.map(etf => {
                const priceData = prices[etf.symbol];
                const currentPrice = priceData?.price || etf.basePrice;
                const change = priceData?.change || 0;
                const changePercent = priceData?.changePercent || 0;
                const isUp = change >= 0;
                const inPortfolio = portfolio.some(a => a.symbol === etf.symbol);

                return (
                  <div 
                    key={etf.symbol} 
                    className={`watchlist-card ${etf.market.toLowerCase()}`}
                    onClick={() => { setSelectedChartSymbol(etf.symbol); setActiveTab('chart'); }}
                  >
                    <div className="watchlist-header">
                      <div className="watchlist-symbol">{etf.symbol}</div>
                      <span className={`market-tag ${etf.market.toLowerCase()}`}>
                        {etf.market === 'IN' ? '🇮🇳' : '🇺🇸'}
                      </span>
                    </div>
                    <div className="watchlist-name">{etf.name}</div>
                    <div className="watchlist-price">
                      <span className={`price ${isUp ? 'up' : 'down'}`}>
                        {formatPrice(currentPrice, etf.market)}
                      </span>
                    </div>
                    <div className={`watchlist-change ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '▲' : '▼'} {formatPrice(Math.abs(change), etf.market)} ({Math.abs(changePercent).toFixed(2)}%)
                    </div>
                    <div className="watchlist-actions">
                      {inPortfolio ? (
                        <span className="in-portfolio-badge">✓ In Portfolio</span>
                      ) : (
                        <button 
                          className="quick-add-btn"
                          onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart Tab */}
        {activeTab === 'chart' && (
          <div className="chart-section">
            <div className="section-header">
              <h2>TradingView Chart</h2>
              <select 
                className="chart-select"
                value={selectedChartSymbol}
                onChange={(e) => setSelectedChartSymbol(e.target.value)}
              >
                {ETF_LIST.map(etf => (
                  <option key={etf.symbol} value={etf.symbol}>
                    {etf.market === 'IN' ? '🇮🇳' : '🇺🇸'} {etf.symbol} - {etf.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="chart-container">
              <iframe
                key={selectedChartSymbol}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=${
                  ETF_LIST.find(e => e.symbol === selectedChartSymbol)?.market === 'IN' 
                    ? 'NSE:' + selectedChartSymbol 
                    : selectedChartSymbol
                }&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1a1a2e&studies=MASimple@tv-basicstudies,RSI@tv-basicstudies,MACD@tv-basicstudies&theme=dark&style=1&timezone=Asia%2FKolkata`}
                style={{ width: '100%', height: '500px', border: 'none' }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span className="sync-id">Sync ID: <strong>{syncId}</strong></span>
            <span className="last-sync">Last Sync: {lastSync.toLocaleTimeString()}</span>
          </div>
          <div className="footer-right">
            <span className="live-badge">
              <span className="live-dot"></span>
              Prices updating every 1.5s
            </span>
          </div>
        </footer>
      </main>

      {/* Add Asset Modal */}
      {showAddModal && (
        <AddAssetModal
          etfList={ETF_LIST}
          prices={prices}
          onAdd={handleAddAsset}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Asset Modal */}
      {showEditModal && selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          currentPrice={prices[selectedAsset.symbol]?.price || selectedAsset.currentPrice}
          onUpdate={handleUpdateAsset}
          onClose={() => { setShowEditModal(false); setSelectedAsset(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAsset && (
        <DeleteModal
          asset={selectedAsset}
          onDelete={() => handleDeleteAsset(selectedAsset.id)}
          onClose={() => { setShowDeleteModal(false); setSelectedAsset(null); }}
        />
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <SyncModal
          currentSyncId={syncId}
          isOnline={isOnline}
          lastSync={lastSync}
          onImport={handleImportSync}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </div>
  );
}

// ==================== MODALS ====================

interface AddAssetModalProps {
  etfList: ETF[];
  prices: PriceData;
  onAdd: (etf: ETF, quantity: number, avgPrice: number) => void;
  onClose: () => void;
}

function AddAssetModal({ etfList, prices, onAdd, onClose }: AddAssetModalProps) {
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [avgPrice, setAvgPrice] = useState<string>('');

  const handleSelect = (symbol: string) => {
    const etf = etfList.find(e => e.symbol === symbol);
    if (etf) {
      setSelectedETF(etf);
      setAvgPrice((prices[etf.symbol]?.price || etf.basePrice).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedETF && quantity && avgPrice) {
      onAdd(selectedETF, parseFloat(quantity), parseFloat(avgPrice));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Asset to Portfolio</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select ETF</label>
            <select 
              value={selectedETF?.symbol || ''} 
              onChange={e => handleSelect(e.target.value)}
              required
            >
              <option value="">Choose an ETF...</option>
              <optgroup label="🇮🇳 India ETFs">
                {etfList.filter(e => e.market === 'IN').map(etf => (
                  <option key={etf.symbol} value={etf.symbol}>
                    {etf.symbol} - {etf.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🇺🇸 USA ETFs">
                {etfList.filter(e => e.market === 'US').map(etf => (
                  <option key={etf.symbol} value={etf.symbol}>
                    {etf.symbol} - {etf.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {selectedETF && (
            <div className="selected-etf-info">
              <div className="etf-info-row">
                <span>Current Price:</span>
                <span className="current-price">
                  {formatPrice(prices[selectedETF.symbol]?.price || selectedETF.basePrice, selectedETF.market)}
                </span>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                step="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Buy Price {selectedETF ? (selectedETF.market === 'IN' ? '(₹)' : '($)') : ''}</label>
              <input
                type="number"
                value={avgPrice}
                onChange={e => setAvgPrice(e.target.value)}
                placeholder="Enter price"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          {selectedETF && quantity && avgPrice && (
            <div className="investment-preview">
              <span>Total Investment:</span>
              <span className="total">
                {formatPrice(parseFloat(quantity) * parseFloat(avgPrice), selectedETF.market)}
              </span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!selectedETF || !quantity || !avgPrice}>
              Add to Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditAssetModalProps {
  asset: PortfolioAsset;
  currentPrice: number;
  onUpdate: (id: string, quantity: number, avgPrice: number) => void;
  onClose: () => void;
}

function EditAssetModal({ asset, currentPrice, onUpdate, onClose }: EditAssetModalProps) {
  const [quantity, setQuantity] = useState<string>(asset.quantity.toString());
  const [avgPrice, setAvgPrice] = useState<string>(asset.avgBuyPrice.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(asset.id, parseFloat(quantity), parseFloat(avgPrice));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {asset.symbol}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="selected-etf-info">
            <div className="etf-info-row">
              <span>Asset:</span>
              <span>{asset.name}</span>
            </div>
            <div className="etf-info-row">
              <span>Current Price:</span>
              <span className="current-price">{formatPrice(currentPrice, asset.market)}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="1"
                step="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Avg Buy Price {asset.market === 'IN' ? '(₹)' : '($)'}</label>
              <input
                type="number"
                value={avgPrice}
                onChange={e => setAvgPrice(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Update Asset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  asset: PortfolioAsset;
  onDelete: () => void;
  onClose: () => void;
}

function DeleteModal({ asset, onDelete, onClose }: DeleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Asset</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="delete-content">
          <div className="delete-icon">⚠️</div>
          <p>Are you sure you want to remove <strong>{asset.symbol}</strong> from your portfolio?</p>
          <div className="delete-details">
            <div>Quantity: {asset.quantity}</div>
            <div>Invested: {formatPrice(asset.quantity * asset.avgBuyPrice, asset.market)}</div>
          </div>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

interface SyncModalProps {
  currentSyncId: string;
  isOnline: boolean;
  lastSync: Date;
  onImport: (syncId: string) => void;
  onClose: () => void;
}

function SyncModal({ currentSyncId, isOnline, lastSync, onImport, onClose }: SyncModalProps) {
  const [importId, setImportId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSyncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (importId.trim()) {
      onImport(importId.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal sync-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>☁️ Cloud Sync</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="sync-content">
          <div className="sync-status">
            <span className={`sync-indicator ${isOnline ? 'online' : 'offline'}`}></span>
            <span>{isOnline ? 'Connected' : 'Offline'}</span>
          </div>

          <div className="sync-section">
            <h4>Your Sync ID</h4>
            <p className="sync-desc">Share this ID to access your portfolio on other devices</p>
            <div className="sync-id-box">
              <code>{currentSyncId}</code>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="sync-divider">
            <span>OR</span>
          </div>

          <div className="sync-section">
            <h4>Import Existing Portfolio</h4>
            <p className="sync-desc">Enter a Sync ID to load that portfolio</p>
            <div className="import-box">
              <input
                type="text"
                value={importId}
                onChange={e => setImportId(e.target.value)}
                placeholder="Enter Sync ID (e.g., DM-ABC123)"
              />
              <button className="import-btn" onClick={handleImport} disabled={!importId.trim()}>
                Import
              </button>
            </div>
          </div>

          <div className="sync-info">
            <p>Last synced: {lastSync.toLocaleString()}</p>
            <p className="sync-note">
              💡 Your portfolio syncs automatically across browser tabs and windows.
              Use the Sync ID to access on different devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
