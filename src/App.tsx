import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TradingChart } from './components/TradingChart';
import { QuantumForensics } from './components/QuantumForensics';
import { AIPlanner } from './components/AIPlanner';
import { ETFTable } from './components/ETFTable';
import { AIInsights } from './components/AIInsights';
import { NewsFeed } from './components/NewsFeed';
import { useETFData } from './hooks/useETFData';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave, isSyncing } = useETFData();

  const filteredETFs = useMemo(() => {
    if (!searchQuery.trim()) return etfs;
    return etfs.filter(etf => etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || etf.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [etfs, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        <StatCards etfs={etfs} usdInrRate={usdInrRate} />

        {/* Top Analytics Grid: Chart | Forensics | AI Planner */}
        {selectedETF && (
          <div className="top-pro-grid" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '5.5fr 2.5fr 2.5fr', gap: '24px' }}>
            <TradingChart selectedETF={selectedETF} />
            <QuantumForensics selectedETF={selectedETF} />
            <AIPlanner etfs={etfs} usdInrRate={usdInrRate} />
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            {isSyncing && <span style={{ color: '#06b6d4', fontSize: '12px', fontWeight: 'bold' }}>☁️ Syncing to Cloud...</span>}
          </div>
          <ETFTable
            etfs={filteredETFs}
            selectedETF={selectedETF}
            onSelectETF={selectETF}
            getFlash={getFlash}
            updateAssetDetails={updateAssetDetails}
            addAsset={addAsset}
            deleteAsset={deleteAsset}
            forceSave={forceSave}
          />
        </div>

        <div className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <AIInsights />
          <NewsFeed />
        </div>
      </main>

      <style>{`
        @media (max-width: 1400px) { .top-pro-grid { grid-template-columns: 5fr 3fr 3fr !important; } }
        @media (max-width: 1200px) { 
          .top-pro-grid { grid-template-columns: 1fr 1fr !important; } 
          .top-pro-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 900px) { 
          .top-pro-grid { grid-template-columns: 1fr !important; } 
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
