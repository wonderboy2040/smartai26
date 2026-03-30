import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TradingChart } from './components/TradingChart';
import { QuantumForensics } from './components/QuantumForensics'; // Naya import
import { ETFTable } from './components/ETFTable';
import { AIInsights } from './components/AIInsights';
import { NewsFeed } from './components/NewsFeed';
import { AIPerformance } from './components/AIPerformance';
import { useETFData } from './hooks/useETFData';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { etfs, selectedETF, selectETF, getFlash, usdInrRate, updateAssetDetails, addAsset, deleteAsset, forceSave } = useETFData();

  const filteredETFs = useMemo(() => {
    if (!searchQuery.trim()) return etfs;
    const query = searchQuery.toLowerCase();
    return etfs.filter(
      etf => etf.symbol.toLowerCase().includes(query) || etf.name.toLowerCase().includes(query)
    );
  }, [etfs, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        <StatCards etfs={etfs} usdInrRate={usdInrRate} />

        {/* Naya Pro Grid Layout: Live Chart + Quantum Forensics */}
        {selectedETF ? (
          <div className="chart-forensics-grid" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px' }}>
            <TradingChart selectedETF={selectedETF} />
            <QuantumForensics selectedETF={selectedETF} />
          </div>
        ) : (
          <div style={{ background: 'rgba(20, 20, 35, 0.8)', borderRadius: '16px', border: '1px dashed rgba(139, 92, 246, 0.4)', padding: '40px', textAlign: 'center', marginBottom: '24px', color: '#94a3b8' }}>
            <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>📉</span>
            Your portfolio is empty. Add an asset below to unlock AI Analysis and Charts.
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
            forceSave={forceSave}
          />
        </div>

        <div className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <AIInsights />
          <NewsFeed />
          <AIPerformance />
        </div>
      </main>

      {/* Footer same rahega... */}
      
      <style>{`
        @media (max-width: 1400px) { .chart-forensics-grid { grid-template-columns: 6fr 4fr !important; } }
        @media (max-width: 1100px) { .chart-forensics-grid { grid-template-columns: 1fr !important; } .bottom-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 900px) { .bottom-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}