import { useMemo } from 'react';
import type { Report, ProblemCategory } from '@/types';

interface MapViewProps {
  reports: Report[];
  categories: ProblemCategory[];
  onSelect?: (report: Report) => void;
  selectedId?: string | null;
  height?: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

const colorMap: Record<string, string> = {
  blue: '#3285fc',
  amber: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
};

const statusOpacity: Record<string, number> = {
  submitted: 1,
  analyzing: 0.8,
  analyzed: 1,
  assigned: 1,
  in_progress: 1,
  resolved: 0.4,
  rejected: 0.3,
  closed: 0.3,
};

export function MapView({ reports, categories, onSelect, selectedId, height = '400px', centerLat = 13.0827, centerLng = 80.2707, zoom = 12 }: MapViewProps) {
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => { map[c.id] = colorMap[c.color] || '#3285fc'; });
    return map;
  }, [categories]);

  const bounds = useMemo(() => {
    if (reports.length === 0) {
      const d = 0.05;
      return { minLat: centerLat - d, maxLat: centerLat + d, minLng: centerLng - d, maxLng: centerLng + d };
    }
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    reports.forEach((r) => {
      minLat = Math.min(minLat, r.latitude);
      maxLat = Math.max(maxLat, r.latitude);
      minLng = Math.min(minLng, r.longitude);
      maxLng = Math.max(maxLng, r.longitude);
    });
    const pad = 0.01;
    return { minLat: minLat - pad, maxLat: maxLat + pad, minLng: minLng - pad, maxLng: maxLng + pad };
  }, [reports, centerLat, centerLng]);

  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 1; i < 8; i++) {
      const v = (i / 8) * 100;
      lines.push({ x1: v, y1: 0, x2: v, y2: 100 });
      lines.push({ x1: 0, y1: v, x2: 100, y2: v });
    }
    return lines;
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <pattern id="mapGrid" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
            <path d="M 12.5 0 L 0 0 0 12.5" fill="none" stroke="#cbd5e1" strokeWidth="0.15" />
          </pattern>
          <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#mapBg)" />
        <rect width="100" height="100" fill="url(#mapGrid)" />

        {/* Fake roads */}
        <path d="M 0 30 Q 30 28 50 35 T 100 32" fill="none" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 0 60 Q 25 62 50 58 T 100 65" fill="none" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 20 0 Q 22 30 25 50 T 30 100" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
        <path d="M 70 0 Q 68 30 72 55 T 75 100" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
        <path d="M 0 50 L 100 50" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
        <path d="M 50 0 L 50 100" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Fake water body */}
        <ellipse cx="80" cy="75" rx="15" ry="10" fill="#bfdbfe" opacity="0.5" />
        <ellipse cx="15" cy="20" rx="8" ry="6" fill="#bfdbfe" opacity="0.4" />

        {reports.map((report) => {
          const { x, y } = project(report.latitude, report.longitude);
          const color = report.category_id ? categoryColorMap[report.category_id] : '#64748b';
          const opacity = statusOpacity[report.status] ?? 1;
          const isSelected = report.id === selectedId;
          return (
            <g key={report.id} onClick={() => onSelect?.(report)} className={onSelect ? 'cursor-pointer' : ''}>
              {(report.status === 'submitted' || report.status === 'analyzing') && (
                <circle cx={x} cy={y} r="3" fill={color} opacity={0.3}>
                  <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 2.2 : 1.5}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 0.8 : 0.4}
                opacity={opacity}
                style={{ transition: 'r 0.2s' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-3 space-y-1.5">
        <div className="text-xs font-semibold text-slate-700 mb-1">Problem Types</div>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorMap[cat.color] }} />
            <span className="text-xs text-slate-600">{cat.display_name.split(' / ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-2.5 py-1 text-xs font-mono text-slate-500">
        z={zoom}
      </div>

      {reports.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-sm text-slate-400 bg-white/80 px-4 py-2 rounded-xl">No reports to display</div>
        </div>
      )}
    </div>
  );
}
