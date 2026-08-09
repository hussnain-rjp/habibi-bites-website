import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';

/**
 * Visual Independence Day Festive Theme Overlay Component
 * Non-intrusive decoration layer (Buntings, Floating Flags, Green & White Balloons).
 * Completely controlled by Admin Panel toggle. Default: Enabled (true).
 */
export const IndependenceDecorations = () => {
  const db = useDb();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadThemeState = async () => {
      try {
        if (db && db.getSeasonalTheme) {
          const res = await db.getSeasonalTheme();
          if (isMounted) setEnabled(res.enabled);
        } else {
          const raw = localStorage.getItem('habibi_bites_delivery_settings');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.seasonal_theme_enabled !== undefined && isMounted) {
              setEnabled(!!parsed.seasonal_theme_enabled);
            }
          }
        }
      } catch (e) {
        console.warn('Seasonal theme sync error:', e);
      }
    };

    loadThemeState();

    const handleStorageChange = () => loadThemeState();
    window.addEventListener('storage_changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage_changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [db]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.body.classList.add('azaadi-theme-active');
      } else {
        document.body.classList.remove('azaadi-theme-active');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('azaadi-theme-active');
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="independence-theme-wrapper" style={{ pointerEvents: 'none', userSelect: 'none' }}>
      {/* Top Banner String of Buntings (Jhandiyan) */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '38px',
          zIndex: 102,
          pointerEvents: 'none',
          overflow: 'hidden',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'flex-start',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
        }}
      >
        {Array.from({ length: 80 }).map((_, idx) => (
          <div 
            key={idx} 
            style={{ 
              animation: `buntingSway ${3 + (idx % 3) * 0.5}s ease-in-out infinite ${(idx % 4) * 0.2}s`, 
              transformOrigin: 'top center',
              flexShrink: 0
            }}
          >
            {idx % 2 === 0 ? (
              // Green Bunting
              <svg width="26" height="36" viewBox="0 0 24 32" fill="none">
                <polygon points="0,0 24,0 12,32" fill="#00401A" />
                <circle cx="12" cy="11" r="4.5" fill="#FFFFFF" />
                <circle cx="13.2" cy="10" r="3.8" fill="#00401A" />
                <polygon points="13,7.5 13.5,8.8 14.8,8.8 13.8,9.5 14.2,10.8 13,10 11.8,10.8 12.2,9.5 11.2,8.8 12.5,8.8" fill="#FFFFFF" />
              </svg>
            ) : (
              // White Bunting
              <svg width="26" height="36" viewBox="0 0 24 32" fill="none">
                <polygon points="0,0 24,0 12,32" fill="#FFFFFF" />
                <circle cx="12" cy="11" r="4.5" fill="#00401A" />
                <circle cx="13.2" cy="10" r="3.8" fill="#FFFFFF" />
                <polygon points="13,7.5 13.5,8.8 14.8,8.8 13.8,9.5 14.2,10.8 13,10 11.8,10.8 12.2,9.5 11.2,8.8 12.5,8.8" fill="#00401A" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 🇵🇰 4 Floating Pakistani Flags */}
      <div style={{ position: 'fixed', top: '18%', left: '14px', zIndex: 9990, pointerEvents: 'none', animation: 'floatWaving 4.2s ease-in-out infinite' }}>
        <svg width="34" height="22" viewBox="0 0 36 24" fill="none" style={{ borderRadius: '3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
          <rect width="36" height="24" fill="#00401A" />
          <rect width="9" height="24" fill="#FFFFFF" />
          <circle cx="23" cy="12" r="6" fill="#FFFFFF" />
          <circle cx="24.8" cy="10.8" r="5" fill="#00401A" />
          <polygon points="24.5,8 25.2,9.6 27,9.6 25.6,10.6 26.1,12.2 24.5,11.2 22.9,12.2 23.4,10.6 22,9.6 23.8,9.6" fill="#FFFFFF" />
        </svg>
      </div>
      <div style={{ position: 'fixed', top: '22%', right: '14px', zIndex: 9990, pointerEvents: 'none', animation: 'floatWaving 4.8s ease-in-out infinite 0.8s' }}>
        <svg width="34" height="22" viewBox="0 0 36 24" fill="none" style={{ borderRadius: '3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
          <rect width="36" height="24" fill="#00401A" />
          <rect width="9" height="24" fill="#FFFFFF" />
          <circle cx="23" cy="12" r="6" fill="#FFFFFF" />
          <circle cx="24.8" cy="10.8" r="5" fill="#00401A" />
          <polygon points="24.5,8 25.2,9.6 27,9.6 25.6,10.6 26.1,12.2 24.5,11.2 22.9,12.2 23.4,10.6 22,9.6 23.8,9.6" fill="#FFFFFF" />
        </svg>
      </div>
      <div style={{ position: 'fixed', top: '60%', left: '14px', zIndex: 9990, pointerEvents: 'none', animation: 'floatWaving 4.5s ease-in-out infinite 1.4s' }}>
        <svg width="34" height="22" viewBox="0 0 36 24" fill="none" style={{ borderRadius: '3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
          <rect width="36" height="24" fill="#00401A" />
          <rect width="9" height="24" fill="#FFFFFF" />
          <circle cx="23" cy="12" r="6" fill="#FFFFFF" />
          <circle cx="24.8" cy="10.8" r="5" fill="#00401A" />
          <polygon points="24.5,8 25.2,9.6 27,9.6 25.6,10.6 26.1,12.2 24.5,11.2 22.9,12.2 23.4,10.6 22,9.6 23.8,9.6" fill="#FFFFFF" />
        </svg>
      </div>
      <div style={{ position: 'fixed', top: '65%', right: '14px', zIndex: 9990, pointerEvents: 'none', animation: 'floatWaving 5.0s ease-in-out infinite 0.4s' }}>
        <svg width="34" height="22" viewBox="0 0 36 24" fill="none" style={{ borderRadius: '3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
          <rect width="36" height="24" fill="#00401A" />
          <rect width="9" height="24" fill="#FFFFFF" />
          <circle cx="23" cy="12" r="6" fill="#FFFFFF" />
          <circle cx="24.8" cy="10.8" r="5" fill="#00401A" />
          <polygon points="24.5,8 25.2,9.6 27,9.6 25.6,10.6 26.1,12.2 24.5,11.2 22.9,12.2 23.4,10.6 22,9.6 23.8,9.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* 🎈 4 Green & White Balloon Clusters */}
      {/* Bottom Left Cluster */}
      <div style={{ position: 'fixed', bottom: '22px', left: '20px', zIndex: 9990, pointerEvents: 'none', animation: 'floatBalloon 5.2s ease-in-out infinite' }}>
        <svg width="55" height="75" viewBox="0 0 60 85" fill="none" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}>
          <g transform="translate(0, 5)">
            <ellipse cx="20" cy="22" rx="15" ry="20" fill="url(#greenGrad1)" />
            <ellipse cx="15" cy="14" rx="4" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-20 15 14)" />
            <polygon points="20,42 17,46 23,46" fill="#00401a" />
            <path d="M20 46 Q15 60 28 80" stroke="#00401a" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>
          <g transform="translate(20, 0)">
            <ellipse cx="22" cy="22" rx="15" ry="20" fill="url(#whiteGrad1)" stroke="#e0e0e0" strokeWidth="0.5" />
            <ellipse cx="17" cy="14" rx="4" ry="7" fill="#ffffff" opacity="0.6" transform="rotate(-20 17 14)" />
            <polygon points="22,42 19,46 25,46" fill="#e0e0e0" />
            <path d="M22 46 Q28 60 28 80" stroke="#cccccc" strokeWidth="1.5" fill="none" opacity="0.8" />
          </g>
          <g transform="translate(10, -10)">
            <ellipse cx="20" cy="20" rx="14" ry="18" fill="url(#greenGrad1)" />
            <ellipse cx="15" cy="13" rx="3.5" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-20 15 13)" />
            <polygon points="20,38 17,42 23,42" fill="#00401a" />
            <path d="M20 42 Q22 55 28 80" stroke="#00401a" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>
          <defs>
            <radialGradient id="greenGrad1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#25d366" />
              <stop offset="60%" stopColor="#00401a" />
              <stop offset="100%" stopColor="#00220d" />
            </radialGradient>
            <radialGradient id="whiteGrad1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom Right Cluster */}
      <div style={{ position: 'fixed', bottom: '22px', right: '20px', zIndex: 9990, pointerEvents: 'none', animation: 'floatBalloon 4.8s ease-in-out infinite 1.2s' }}>
        <svg width="55" height="75" viewBox="0 0 60 85" fill="none" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}>
          <g transform="translate(0, 0)">
            <ellipse cx="22" cy="22" rx="15" ry="20" fill="url(#whiteGrad2)" stroke="#e0e0e0" strokeWidth="0.5" />
            <ellipse cx="17" cy="14" rx="4" ry="7" fill="#ffffff" opacity="0.6" transform="rotate(-20 17 14)" />
            <polygon points="22,42 19,46 25,46" fill="#e0e0e0" />
            <path d="M22 46 Q16 60 28 80" stroke="#cccccc" strokeWidth="1.5" fill="none" opacity="0.8" />
          </g>
          <g transform="translate(20, 5)">
            <ellipse cx="20" cy="22" rx="15" ry="20" fill="url(#greenGrad2)" />
            <ellipse cx="15" cy="14" rx="4" ry="7" fill="#ffffff" opacity="0.35" transform="rotate(-20 15 14)" />
            <polygon points="20,42 17,46 23,46" fill="#00401a" />
            <path d="M20 46 Q25 60 28 80" stroke="#00401a" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>
          <g transform="translate(10, -10)">
            <ellipse cx="20" cy="20" rx="14" ry="18" fill="url(#greenGrad2)" />
            <ellipse cx="15" cy="13" rx="3.5" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-20 15 13)" />
            <polygon points="20,38 17,42 23,42" fill="#00401a" />
            <path d="M20 42 Q22 55 28 80" stroke="#00401a" strokeWidth="1.5" fill="none" opacity="0.6" />
          </g>
          <defs>
            <radialGradient id="greenGrad2" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#25d366" />
              <stop offset="60%" stopColor="#00401a" />
              <stop offset="100%" stopColor="#00220d" />
            </radialGradient>
            <radialGradient id="whiteGrad2" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Upper Left Floating Balloon Duo */}
      <div style={{ position: 'fixed', top: '42%', left: '20px', zIndex: 9990, pointerEvents: 'none', animation: 'floatBalloon 5.6s ease-in-out infinite 0.6s' }}>
        <svg width="42" height="60" viewBox="0 0 50 70" fill="none" style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}>
          <g transform="translate(0, 0)">
            <ellipse cx="18" cy="18" rx="12" ry="16" fill="url(#greenGrad3)" />
            <ellipse cx="14" cy="11" rx="3" ry="5" fill="#ffffff" opacity="0.35" transform="rotate(-20 14 11)" />
            <polygon points="18,34 15,38 21,38" fill="#00401a" />
            <path d="M18 38 Q14 50 24 68" stroke="#00401a" strokeWidth="1.2" fill="none" opacity="0.6" />
          </g>
          <g transform="translate(14, -8)">
            <ellipse cx="18" cy="18" rx="12" ry="16" fill="url(#whiteGrad3)" stroke="#e0e0e0" strokeWidth="0.5" />
            <ellipse cx="14" cy="11" rx="3" ry="5" fill="#ffffff" opacity="0.6" transform="rotate(-20 14 11)" />
            <polygon points="18,34 15,38 21,38" fill="#e0e0e0" />
            <path d="M18 38 Q22 50 24 68" stroke="#cccccc" strokeWidth="1.2" fill="none" opacity="0.8" />
          </g>
          <defs>
            <radialGradient id="greenGrad3" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#25d366" />
              <stop offset="60%" stopColor="#00401a" />
              <stop offset="100%" stopColor="#00220d" />
            </radialGradient>
            <radialGradient id="whiteGrad3" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Upper Right Floating Balloon Duo */}
      <div style={{ position: 'fixed', top: '45%', right: '20px', zIndex: 9990, pointerEvents: 'none', animation: 'floatBalloon 6.0s ease-in-out infinite 1.8s' }}>
        <svg width="42" height="60" viewBox="0 0 50 70" fill="none" style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}>
          <g transform="translate(0, -8)">
            <ellipse cx="18" cy="18" rx="12" ry="16" fill="url(#whiteGrad4)" stroke="#e0e0e0" strokeWidth="0.5" />
            <ellipse cx="14" cy="11" rx="3" ry="5" fill="#ffffff" opacity="0.6" transform="rotate(-20 14 11)" />
            <polygon points="18,34 15,38 21,38" fill="#e0e0e0" />
            <path d="M18 38 Q14 50 24 68" stroke="#cccccc" strokeWidth="1.2" fill="none" opacity="0.8" />
          </g>
          <g transform="translate(14, 0)">
            <ellipse cx="18" cy="18" rx="12" ry="16" fill="url(#greenGrad4)" />
            <ellipse cx="14" cy="11" rx="3" ry="5" fill="#ffffff" opacity="0.35" transform="rotate(-20 14 11)" />
            <polygon points="18,34 15,38 21,38" fill="#00401a" />
            <path d="M18 38 Q22 50 24 68" stroke="#00401a" strokeWidth="1.2" fill="none" opacity="0.6" />
          </g>
          <defs>
            <radialGradient id="greenGrad4" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#25d366" />
              <stop offset="60%" stopColor="#00401a" />
              <stop offset="100%" stopColor="#00220d" />
            </radialGradient>
            <radialGradient id="whiteGrad4" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
