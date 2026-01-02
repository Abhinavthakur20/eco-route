import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Cool Welcome Animation Overlay Component
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
        {/* Animated Icon */}
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

        {/* Text */}
        <div className="space-y-2 animate-slide-up">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Eco-Route
          </h1>
          <p className="text-white/90 text-sm font-medium tracking-wide">
            🌍 Plan sustainable journeys
          </p>
        </div>

        {/* Loading Dots */}
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

// Component to handle responsive resizing and route fitting
function MapController({ source, destination, routePoints, startPos }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    if (routePoints.length > 0) {
      map.fitBounds(routePoints, { padding: [40, 40], duration: 1 });
    } else if (source && destination) {
      map.fitBounds(
        [
          [source.lat, source.lon],
          [destination.lat, destination.lon],
        ],
        {
          padding: [50, 50],
          duration: 1,
        }
      );
    } else if (source) {
      map.flyTo([source.lat, source.lon], window.innerWidth < 768 ? 13 : 15, {
        duration: 1,
      });
    } else if (destination) {
      map.flyTo(
        [destination.lat, destination.lon],
        window.innerWidth < 768 ? 13 : 15,
        { duration: 1 }
      );
    } else if (startPos) {
      map.flyTo(startPos, window.innerWidth < 768 ? 12 : 14, { duration: 1.5 });
    }

    return () => clearTimeout(timer);
  }, [source, destination, routePoints, startPos, map]);

  return null;
}

// Animated Pulsing User Location Marker
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

  const INDIA_CENTER = [20.5937, 78.9629];
  const ORS_API_KEY =
    import.meta.env.VITE_ORS_API_KEY ||
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImU5NWEwMGY5ZWI4ZTRkZGRiMmM0YjQ0YTJjZGE2MWJhIiwiaCI6Im11cm11cjY0In0=";

  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => setStartPos([pos.coords.latitude, pos.coords.longitude]),
      (error) => {
        console.warn("Geolocation error:", error.message);
        setStartPos([31.326, 75.5762]); // Fallback to Jalandhar
      },
      geoOptions
    );
  }, []);

  useEffect(() => {
    const getRoute = async () => {
      const origin = source
        ? { lat: source.lat, lon: source.lon }
        : startPos
        ? { lat: startPos[0], lon: startPos[1] }
        : null;

      if (!origin || !destination) {
        setRoutePoints([]);
        return;
      }

      if (!ORS_API_KEY) {
        console.error("ORS API Key is missing!");
        onRouteError?.("API configuration error");
        return;
      }

      setIsLoadingRoute(true);
      let retries = 3;
      let delay = 1000;

      // Map our mode names to ORS API modes
      const orsMode =
        mode === "driving-hgv"
          ? "driving-hgv"
          : mode === "foot-walking"
          ? "driving-car" // Use driving-car for train (we'll just calculate differently)
          : "driving-car";

      while (retries > 0) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/${orsMode}/geojson`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json, application/geo+json",
                Authorization: ORS_API_KEY,
              },
              body: JSON.stringify({
                coordinates: [
                  [origin.lon, origin.lat],
                  [destination.lon, destination.lat],
                ],
                radiuses: [5000, 5000],
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);
          const data = await response.json();

          if (response.status === 429) {
            console.warn(
              `Rate limit exceeded. Retrying in ${delay}ms... (${retries} attempts left)`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            retries--;
            continue;
          }

          if (!response.ok) {
            if (data.error) {
              switch (data.error.code) {
                case 2010:
                  console.warn("Location too remote for routing");
                  onRouteError?.(
                    "One of these locations is too remote. Please try locations with better road access."
                  );
                  setRoutePoints([]);
                  setIsLoadingRoute(false);
                  return;
                case 2009:
                  console.warn("Route exceeds maximum distance");
                  onRouteError?.(
                    "Distance too far for this transport mode. Try a different mode."
                  );
                  setRoutePoints([]);
                  setIsLoadingRoute(false);
                  return;
                default:
                  throw new Error(data.error.message || "Routing failed");
              }
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates.map((c) => [
              c[1],
              c[0],
            ]);
            const dist = data.features[0].properties.summary.distance / 1000;
            setRoutePoints(coords);
            onRouteFound(dist);
            setIsLoadingRoute(false);
            return;
          } else {
            throw new Error("No route found");
          }
        } catch (err) {
          console.error(
            `Routing attempt failed (${4 - retries}/3):`,
            err.message
          );
          retries--;

          if (err.name === "AbortError") {
            onRouteError?.(
              "Request timed out. Please check your internet connection."
            );
            setIsLoadingRoute(false);
            return;
          }

          if (retries === 0) {
            setRoutePoints([]);
            setIsLoadingRoute(false);
            onRouteError?.(
              "Unable to find route. Please try different locations or check your connection."
            );
            return;
          } else {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
    };

    getRoute();
  }, [source, destination, startPos, mode, onRouteFound, onRouteError]);

  // Get route color based on mode
  const getRouteColor = () => {
    switch (mode) {
      case "driving-car":
        return "#ef4444"; // Red for private car
      case "driving-hgv":
        return "#3b82f6"; // Blue for bus
      case "foot-walking":
        return "#22c55e"; // Green for train
      default:
        return "#22c55e";
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Welcome Animation */}
      {showWelcome && (
        <WelcomeAnimation onComplete={() => setShowWelcome(false)} />
      )}

      {/* Route Loading Indicator */}
      {isLoadingRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 animate-in slide-in-from-top-4">
          <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">
            Finding best route...
          </span>
        </div>
      )}

      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        className="h-full w-full outline-none z-0"
        zoomControl={window.innerWidth > 768}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Source Marker with Animation */}
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

        {/* Destination Marker with Animation */}
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

        {/* Animated User Location Marker */}
        {!source && startPos && <AnimatedUserMarker position={startPos} />}

        {/* Animated Route Polyline with Mode-based Color */}
        {routePoints.length > 0 && (
          <>
            {/* Glow effect layer */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: getRouteColor(),
                weight: 8,
                opacity: 0.3,
                className: "route-glow",
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: getRouteColor(),
                weight: 5,
                opacity: 0.9,
                className: "route-line",
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
