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

// Component to handle responsive resizing and route fitting
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
  const abortControllerRef = useRef(null);

  const INDIA_CENTER = [20.5937, 78.9629];
  const ORS_API_KEY =
    import.meta.env.VITE_ORS_API_KEY ||
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImU5NWEwMGY5ZWI4ZTRkZGRiMmM0YjQ0YTJjZGE2MWJhIiwiaCI6Im11cm11cjY0In0=";

  // Optimized geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      const geoOptions = {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // Cache for 5 minutes
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

  // Optimized route fetching with GET method (faster than POST)
  const getRoute = useCallback(async () => {
    // Abort previous request if exists
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

    if (!ORS_API_KEY) {
      onRouteError?.("API configuration error");
      return;
    }

    setIsLoadingRoute(true);
    abortControllerRef.current = new AbortController();

    // Map transport modes
    const orsMode =
      mode === "driving-hgv" ? "driving-hgv" : "driving-car";

    try {
      // Using simpler GET request for better performance
      const url = `https://api.openrouteservice.org/v2/directions/${orsMode}?` +
        `start=${origin.lon},${origin.lat}&` +
        `end=${destination.lon},${destination.lat}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
          Authorization: ORS_API_KEY,
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific errors
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }

        if (response.status === 404 || response.status === 500) {
          throw new Error("Route not found. Please try different locations.");
        }

        if (errorData.error) {
          switch (errorData.error.code) {
            case 2010:
              throw new Error("Location too remote for routing. Try locations with better road access.");
            case 2009:
              throw new Error("Distance too far for this transport mode.");
            case 2004:
              throw new Error("Invalid location coordinates.");
            default:
              throw new Error(errorData.error.message || "Routing failed");
          }
        }

        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
        const dist = data.features[0].properties.summary.distance / 1000;

        setRoutePoints(coords);
        onRouteFound(dist);
        setIsLoadingRoute(false);
      } else {
        throw new Error("No route data received");
      }
    } catch (err) {
      // Don't show error if request was aborted (new request started)
      if (err.name === "AbortError") {
        return;
      }

      console.error("Route error:", err.message);
      setRoutePoints([]);
      setIsLoadingRoute(false);

      // User-friendly error messages
      if (err.message.includes("Failed to fetch")) {
        onRouteError?.("Network error. Please check your internet connection.");
      } else {
        onRouteError?.(err.message);
      }
    }
  }, [source, destination, startPos, mode, onRouteFound, onRouteError, ORS_API_KEY]);

  // Trigger route calculation
  useEffect(() => {
    getRoute();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getRoute]);

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
          updateWhenIdle={true}
          keepBuffer={2}
        />

        {/* Source Marker */}
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

        {/* Destination Marker */}
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

        {/* User Location Marker */}
        {!source && startPos && <AnimatedUserMarker position={startPos} />}

        {/* Route Polyline */}
        {routePoints.length > 0 && (
          <>
            {/* Glow effect */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: getRouteColor(),
                weight: 8,
                opacity: 0.3,
              }}
            />
            {/* Main line */}
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
