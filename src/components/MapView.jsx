import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Welcome Animation Component
function WelcomeAnimation({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[2000] bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 flex items-center justify-center animate-fade-out">
      <div className="text-center space-y-4 animate-scale-in">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          <div className="relative bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-green-600 animate-bounce-slow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2 animate-slide-up">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Eco-Route
          </h1>
          <p className="text-white/90 text-sm font-medium tracking-wide">
            🌍 Plan sustainable journeys
          </p>
        </div>

        <div className="flex gap-2 justify-center pt-4">
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Map Controller Component
function MapController({ source, destination, routePoints, startPos }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    if (routePoints.length > 0) {
      map.fitBounds(routePoints, { padding: [40, 40], duration: 0.8 });
    } else if (source && destination) {
      map.fitBounds(
        [
          [source.lat, source.lon],
          [destination.lat, destination.lon],
        ],
        {
          padding: [50, 50],
          duration: 0.8,
        }
      );
    } else if (source) {
      map.flyTo([source.lat, source.lon], window.innerWidth < 768 ? 13 : 15, {
        duration: 0.8,
      });
    } else if (destination) {
      map.flyTo(
        [destination.lat, destination.lon],
        window.innerWidth < 768 ? 13 : 15,
        { duration: 0.8 }
      );
    } else if (startPos) {
      map.flyTo(startPos, window.innerWidth < 768 ? 12 : 14, { duration: 1 });
    }

    return () => clearTimeout(timer);
  }, [source, destination, routePoints, startPos, map]);

  return null;
}

// Animated User Marker
function AnimatedUserMarker({ position }) {
  return (
    <>
      <CircleMarker
        center={position}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          weight: 1,
        }}
        radius={20}
        className="animate-ping"
      />
      <CircleMarker
        center={position}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          weight: 2,
        }}
        radius={12}
      />
      <CircleMarker
        center={position}
        pathOptions={{
          color: "white",
          fillColor: "#3b82f6",
          fillOpacity: 1,
          weight: 3,
        }}
        radius={8}
      >
        <Popup>
          <div className="text-xs font-semibold">📍 You are here</div>
        </Popup>
      </CircleMarker>
    </>
  );
}

export default function MapView({
  source,
  destination,
  mode,
  onRouteFound,
  onRouteError,
}) {
  const [startPos, setStartPos] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const abortControllerRef = useRef(null);

  const INDIA_CENTER = [20.5937, 78.9629];

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      const geoOptions = {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStartPos([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setStartPos(INDIA_CENTER);
        },
        geoOptions
      );
    } else {
      setStartPos(INDIA_CENTER);
    }
  }, []);

  // OPTIMIZED: OSRM Route Fetching (FREE & FAST!)
  const getRoute = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const origin = source
      ? { lat: source.lat, lon: source.lon }
      : startPos
      ? { lat: startPos[0], lon: startPos[1] }
      : null;

    if (!origin || !destination) {
      setRoutePoints([]);
      return;
    }

    setIsLoadingRoute(true);
    abortControllerRef.current = new AbortController();

    try {
      // OSRM Free Public API - No API Key Required!
      const profile = mode === "driving-hgv" ? "car" : "car"; // OSRM uses: car, bike, foot
      const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Could not calculate route");
      }

      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        const dist = route.distance / 1000; // Convert to km

        setRoutePoints(coords);
        onRouteFound(dist);
        setIsLoadingRoute(false);
      } else {
        throw new Error("No route found");
      }
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Route error:", err);
      setRoutePoints([]);
      setIsLoadingRoute(false);

      if (err.message.includes("Failed to fetch")) {
        onRouteError?.("Network error. Check your internet connection.");
      } else {
        onRouteError?.("Could not find route. Try different locations.");
      }
    }
  }, [source, destination, startPos, mode, onRouteFound, onRouteError]);

  useEffect(() => {
    getRoute();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getRoute]);

  const getRouteColor = () => {
    switch (mode) {
      case "driving-car":
        return "#ef4444";
      case "driving-hgv":
        return "#3b82f6";
      case "foot-walking":
        return "#22c55e";
      default:
        return "#22c55e";
    }
  };

  return (
    <div className="h-full w-full relative">
      {showWelcome && (
        <WelcomeAnimation onComplete={() => setShowWelcome(false)} />
      )}

      {isLoadingRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 animate-in slide-in-from-top-4">
          <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">
            Calculating route...
          </span>
        </div>
      )}

      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        className="h-full w-full outline-none z-0"
        zoomControl={window.innerWidth > 768}
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {source && (
          <Marker position={[source.lat, source.lon]}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-blue-600">🚀 Start Point</p>
                <p className="text-slate-600">
                  {source.display_name?.split(",")[0]}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lon]}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-red-600">🎯 Destination</p>
                <p className="text-slate-600">
                  {destination.display_name?.split(",")[0]}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {!source && startPos && <AnimatedUserMarker position={startPos} />}

        {routePoints.length > 0 && (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: getRouteColor(),
                weight: 8,
                opacity: 0.3,
              }}
            />
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: getRouteColor(),
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        <MapController
          source={source}
          destination={destination}
          routePoints={routePoints}
          startPos={startPos}
        />
      </MapContainer>
    </div>
  );
}
