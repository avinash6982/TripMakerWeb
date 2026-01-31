import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default icon in bundler (Leaflet expects images at a path that breaks with Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(color, size = 24) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "map-marker-custom",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const destinationIcon = createCustomIcon("#dc2626"); // red
const placeIcon = createCustomIcon("#0284c7"); // blue (accent)

/** Colors per day for route polylines (MVP2) */
const DAY_ROUTE_COLORS = [
  "#0284c7", // day 1: blue
  "#059669", // day 2: green
  "#d97706", // day 3: amber
  "#7c3aed", // day 4: violet
  "#dc2626", // day 5: red
  "#0891b2", // day 6: cyan
  "#65a30d", // day 7: lime
  "#c026d3", // day 8: fuchsia
  "#ea580c", // day 9: orange
  "#0d9488", // day 10: teal
];

/** Calls invalidateSize when container is visible or resized so the map doesn't clip on scroll. */
function MapSizeSync() {
  const map = useMap();
  const containerRef = useRef(map.getContainer());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const invalidate = () => {
      map.invalidateSize();
    };

    invalidate(); // initial

    const ro = new ResizeObserver(invalidate);
    ro.observe(container);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting) invalidate();
            },
            { threshold: 0.1 }
          )
        : null;
    if (io) io.observe(container);

    return () => {
      ro.disconnect();
      io?.disconnect();
    };
  }, [map]);

  return null;
}

/**
 * Interactive map with destination marker (red), itinerary markers (blue), and day-wise route polylines (MVP2).
 * @param {Object} props
 * @param {{ lat: number, lon?: number, lng?: number }} props.center - Center of map (destination).
 * @param {string} [props.destinationLabel] - Label for destination popup.
 * @param {Array<{ lat: number, lng: number, name: string, category?: string }>} [props.itineraryMarkers] - Blue markers for places.
 * @param {Array<Array<[number, number]>>} [props.dayRoutes] - MVP2: positions per day for polylines.
 */
const MapView = ({
  center,
  destinationLabel = "",
  itineraryMarkers = [],
  dayRoutes = [],
}) => {
  const lat = center?.lat;
  const lon = center?.lon ?? center?.lng;
  const hasCenter = Number.isFinite(lat) && Number.isFinite(lon);

  if (!hasCenter) {
    return null;
  }

  const centerPos = [lat, lon];

  return (
    <div className="map-view-container">
      <MapContainer
        center={centerPos}
        zoom={13}
        scrollWheelZoom
        className="map-view"
      >
        <MapSizeSync />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(dayRoutes || []).map((positions, dayIndex) => {
          const valid = (positions || []).filter(
            (p) => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
          );
          if (valid.length < 2) return null;
          const color = DAY_ROUTE_COLORS[dayIndex % DAY_ROUTE_COLORS.length];
          return (
            <Polyline
              key={`route-day-${dayIndex}`}
              positions={valid}
              pathOptions={{ color, weight: 4, opacity: 0.8 }}
            />
          );
        })}
        <Marker position={centerPos} icon={destinationIcon}>
          <Popup>
            <strong>{destinationLabel || "Destination"}</strong>
          </Popup>
        </Marker>
        {(itineraryMarkers || []).map((m, i) => {
          if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return null;
          return (
            <Marker
              key={`${m.name}-${i}`}
              position={[m.lat, m.lng]}
              icon={placeIcon}
            >
              <Popup>
                <strong>{m.name}</strong>
                {m.category && (
                  <span className="map-popup-category"> · {m.category}</span>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
