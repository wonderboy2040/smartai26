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

        {/* PRO LAYOUT: Chart on Top, Forensics & Planner Below */}
        {selectedETF && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            
            {/* 1. Full Width Chart Section */}
            <div style={{ width: '100%' }}>
              <TradingChart selectedETF={selectedETF} />
            </div>

            {/* 2. Advanced Analytics Bottom Grid */}
            <div className="mid-pro-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <QuantumForensics selectedETF={selectedETF} />
              <AIPlanner etfs={etfs} usdInrRate={usdInrRate} />
            </div>

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

      {/* GLOBAL STYLES */}
      <style>{`
        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .text-green { color: #089981 !important; text-shadow: 0 0 8px rgba(8, 153, 129, 0.4); }
        .text-red { color: #F23645 !important; text-shadow: 0 0 8px rgba(242, 54, 69, 0.4); }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        
        .pro-input { background: transparent !important; border: 1px solid transparent !important; color: #D1D4DC !important; transition: border 0.2s; }
        .pro-input:focus, .pro-input:hover { border: 1px solid #2A2E39 !important; background: #0B0E14 !important; }
        
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .sync-dot.syncing { animation: pulse 1s infinite; }

        @media (max-width: 1200px) { 
          .mid-pro-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
