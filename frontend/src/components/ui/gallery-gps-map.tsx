"use client";

interface GpsCoords {
  latitude: number;
  longitude: number;
}

interface GalleryGpsMapProps {
  gpsData?: GpsCoords | string | null;
  compact?: boolean;
}

export default function GalleryGpsMap({ gpsData, compact }: GalleryGpsMapProps) {
  if (!gpsData) return null;

  const coords = typeof gpsData === "string" ? parseGpsString(gpsData) : gpsData;
  if (!coords || !isValidCoord(coords.latitude) || !isValidCoord(coords.longitude)) return null;

  const lat = coords.latitude.toFixed(6);
  const lng = coords.longitude.toFixed(6);
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  const osMapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;

  if (compact) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="currentColor" />
        </svg>
        {lat}, {lng}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-white/70">
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="currentColor" />
        </svg>
        <span>{lat}, {lng}</span>
      </div>

      <div className="flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Google Maps
        </a>
        <a
          href={osMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}

function parseGpsString(s: string): GpsCoords | null {
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed === "object" && parsed !== null) {
      return { latitude: Number(parsed.latitude) || 0, longitude: Number(parsed.longitude) || 0 };
    }
  } catch {}
  const parts = s.split(",").map((p) => parseFloat(p.trim()));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] };
  }
  return null;
}

function isValidCoord(v: number): boolean {
  return !isNaN(v) && isFinite(v) && Math.abs(v) <= 180;
}
