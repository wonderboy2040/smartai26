import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TradingChart } from './components/TradingChart';
import { QuantumForensics } from './components/QuantumForensics';
import { AIPlanner } from './components/AIPlanner';
import { ETFTable } from './components/ETFTable';
import { useETFData } from './hooks/useETFData';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateAssetDetails, addAsset, deleteAsset, syncStatus } = useETFData();

  const filteredETFs = useMemo(() => {
    if (!searchQuery.trim()) return etfs;
    return etfs.filter(etf => etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || etf.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [etfs, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14', fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, sans-serif' }}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        <StatCards etfs={etfs} usdInrRate={usdInrRate} />

        {selectedETF && (
          <div className="top-pro-grid" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '6fr 2fr 2fr', gap: '16px' }}>
            <TradingChart selectedETF={selectedETF} />
            <QuantumForensics selectedETF={selectedETF} />
            <AIPlanner etfs={etfs} usdInrRate={usdInrRate} />
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <ETFTable
            etfs={filteredETFs}
            selectedETF={selectedETF}
            onSelectETF={selectETF}
            getFlash={getFlash}
            updateAssetDetails={updateAssetDetails}
            addAsset={addAsset}
            deleteAsset={deleteAsset}
            syncStatus={syncStatus}
          />
        </div>
      </main>

      {/* PRO TRADER GLOBAL STYLES */}
      <style>{`
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        
        /* Flash Animations for ultra-fast WSS feeling */
        .price-cell.up { color: #089981 !important; text-shadow: 0 0 10px rgba(8, 153, 129, 0.8); }
        .price-cell.down { color: #F23645 !important; text-shadow: 0 0 10px rgba(242, 54, 69, 0.8); }
        
        /* Pro Inputs that blend into the table */
        .pro-input {
          background: transparent !important; border: 1px solid transparent !important; color: #D1D4DC !important; transition: border 0.2s;
        }
        .pro-input:focus, .pro-input:hover { border: 1px solid #2A2E39 !important; background: #0B0E14 !important; }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        
        /* Blinking sync light */
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .sync-dot.syncing { animation: pulse 1s infinite; }

        @media (max-width: 1400px) { .top-pro-grid { grid-template-columns: 5fr 3fr 3fr !important; } }
        @media (max-width: 1200px) { 
          .top-pro-grid { grid-template-columns: 1fr 1fr !important; } 
          .top-pro-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 900px) { .top-pro-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
