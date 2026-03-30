import { useState, useEffect } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(15, 15, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
          }}>
            🧠
          </div>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              DeepMind AI
            </h1>
            <p style={{
              fontSize: '10px',
              color: '#8b5cf6',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Portfolio Pro
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: '1',
          maxWidth: '400px',
          position: 'relative',
        }}>
          <input
            type="text"
            placeholder="Search ETFs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              background: 'rgba(30, 30, 50, 0.8)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b5cf6';
              e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8b5cf6',
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Right Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          {/* Live Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}>
            <div
              className="animate-pulse"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#22c55e' }}>
              LIVE
            </span>
          </div>

          {/* Time */}
          <div style={{
            padding: '8px 16px',
            background: 'rgba(30, 30, 50, 0.8)',
            borderRadius: '10px',
            border: '1px solid rgba(100, 100, 150, 0.3)',
          }}>
            <span className="mono" style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </span>
          </div>

          {/* Cloud Sync */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}>
            <span style={{ fontSize: '16px' }}>☁️</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#06b6d4' }}>
              Synced
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
