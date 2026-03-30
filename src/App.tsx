import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TradingChart } from './components/TradingChart';
import { ETFTable } from './components/ETFTable';
import { AIAnalysis } from './components/AIAnalysis';
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

        {selectedETF && (
          <div className="chart-ai-grid" style={{ marginBottom: '24px' }}>
            <TradingChart selectedETF={selectedETF} />
            <AIAnalysis selectedETF={selectedETF} />
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

        <div className="bottom-grid">
          <AIInsights />
          <NewsFeed />
          <AIPerformance />
        </div>
      </main>

      <footer style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px', borderTop: '1px solid rgba(100, 100, 150, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🧠</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>DeepMind AI Portfolio Pro</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Advanced AI-Powered Trading Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>Live API / Smart Fallback Active</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['☁️ Cloud Sync', '🔒 Secure', '⚡ Real-time'].map(badge => (
                <span key={badge} style={{ fontSize: '11px', color: '#94a3b8', padding: '6px 12px', background: 'rgba(100, 100, 150, 0.15)', borderRadius: '6px', border: '1px solid rgba(100, 100, 150, 0.2)' }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .chart-ai-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .bottom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1400px) { .chart-ai-grid { grid-template-columns: 1.5fr 1fr !important; } }
        @media (max-width: 1200px) { .chart-ai-grid { grid-template-columns: 1fr !important; } .bottom-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } .bottom-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          header > div { flex-wrap: wrap; height: auto !important; padding: 12px 16px !important; gap: 12px !important; }
          header > div > div:nth-child(2) { order: 3; width: 100%; max-width: 100% !important; }
          main { padding: 16px !important; }
          footer > div { flex-direction: column; text-align: center; }
        }
        html { scroll-behavior: smooth; }
        @media (max-width: 800px) { table { font-size: 12px; } table th, table td { padding: 10px 12px !important; } }
      `}</style>
    </div>
  );
}