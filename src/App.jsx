import React, { useState, useEffect, useCallback } from "react";
import MapView from "./components/MapView";
import SearchPanel from "./components/SearchPanel";
import ImpactCard from "./components/ImpactCard";
import {
  Leaf,
  Trophy,
  MapPin,
  Navigation,
  Menu,
  X,
  ArrowUpDown,
  Bus,
  Car,
  Train,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState("driving-car");
  const [routeError, setRouteError] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eco-total-saved");
      if (saved) {
        const parsedValue = parseFloat(saved);
        if (!isNaN(parsedValue) && parsedValue >= 0) {
          setTotalSaved(parsedValue);
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (totalSaved > 0) {
        localStorage.setItem("eco-total-saved", totalSaved.toString());
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [totalSaved]);

  const handleRouteFound = useCallback((dist) => {
    if (dist > 0) {
      setDistance(dist);
      setIsLoadingRoute(false);
      setRouteError(null);
    }
  }, []);

  const handleRouteError = useCallback((errorMessage) => {
    setRouteError(errorMessage);
    setDistance(0);
    setIsLoadingRoute(false);
  }, []);

  const handleSourceSelect = (location) => {
    setSource(location);
    setDistance(0);
    setRouteError(null);
  };

  const handleDestinationSelect = (location) => {
    setDestination(location);
    setDistance(0);
    setRouteError(null);
    setIsLoadingRoute(true);

    if (window.innerWidth < 1024) {
      setTimeout(() => setIsSidebarOpen(false), 300);
    }
  };

  const swapLocations = () => {
    if (!source || !destination) return;

    const temp = source;
    setSource(destination);
    setDestination(temp);
    setDistance(0);
    setRouteError(null);
    setIsLoadingRoute(true);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (source && destination) {
      setDistance(0);
      setRouteError(null);
      setIsLoadingRoute(true);
    }
  };

  const resetTrip = () => {
    setSource(null);
    setDestination(null);
    setDistance(0);
    setRouteError(null);
    setIsLoadingRoute(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/20 overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg z-[1001]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Leaf className="text-green-600" size={24} />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Eco-Route
          </h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl text-slate-700 active:scale-90 transition-all duration-300"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[1000] w-full sm:w-80 lg:w-96 
          bg-white/80 backdrop-blur-2xl shadow-2xl border-r border-white/20
          transform transition-all duration-500 ease-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } flex flex-col overflow-hidden`}
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                  <Leaf className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Eco-Route
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Sustainable Travel
                </p>
              </div>
            </div>

            {/* Trophy Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-amber-50 px-3 py-2 rounded-xl border border-yellow-200/50 shadow-md">
              <Trophy size={16} className="text-yellow-600" />
              <div className="text-right">
                <p className="text-[9px] text-yellow-600/70 font-bold uppercase">
                  Saved
                </p>
                <span className="text-sm font-black text-yellow-700">
                  {totalSaved.toFixed(1)}
                  <span className="text-[10px] font-medium ml-0.5">kg</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Trip Planning */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Navigation size={14} className="text-green-500" />
                Plan Journey
              </h2>
              <div className="flex gap-2">
                {(source || destination) && (
                  <button
                    onClick={resetTrip}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                    title="Reset trip"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={swapLocations}
                  disabled={!source || !destination}
                  className={`p-1.5 rounded-lg transition-all ${
                    source && destination
                      ? "hover:bg-green-50 text-slate-400 hover:text-green-600 active:rotate-180"
                      : "text-slate-200 cursor-not-allowed"
                  }`}
                  title="Swap locations"
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>
            </div>

            {/* Search Panel */}
            <div className="bg-gradient-to-br from-slate-50/50 to-white/50 p-4 rounded-2xl border border-slate-100/50">
              <SearchPanel
                onSourceSelect={handleSourceSelect}
                onDestinationSelect={handleDestinationSelect}
              />
            </div>
          </section>

          {/* Transport Mode */}
          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Car size={14} className="text-blue-500" />
              Transport Mode
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {/* Private Car */}
              <button
                onClick={() => handleModeChange("driving-car")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  mode === "driving-car"
                    ? "bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg scale-105"
                    : "bg-white/80 text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Car size={20} className="mx-auto mb-1" />
                <p className="text-[9px] font-bold uppercase">Private</p>
                <p className="text-[9px] font-bold uppercase">Car</p>
              </button>

              {/* Public Bus */}
              <button
                onClick={() => handleModeChange("driving-hgv")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  mode === "driving-hgv"
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-105"
                    : "bg-white/80 text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Bus size={20} className="mx-auto mb-1" />
                <p className="text-[9px] font-bold uppercase">Public</p>
                <p className="text-[9px] font-bold uppercase">Bus</p>
              </button>

              {/* Train */}
              <button
                onClick={() => handleModeChange("foot-walking")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  mode === "foot-walking"
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                    : "bg-white/80 text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Train size={20} className="mx-auto mb-1" />
                <p className="text-[9px] font-bold uppercase">Train</p>
                <p className="text-[9px] font-bold uppercase">Metro</p>
              </button>
            </div>
          </section>

          {/* Error Display */}
          {routeError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-red-700">Route Error</p>
                <p className="text-xs text-red-600 mt-1">{routeError}</p>
              </div>
            </div>
          )}

          {/* Impact Card */}
          {distance > 0 && <ImpactCard distance={distance} mode={mode} />}
        </div>
      </aside>

      {/* Map View */}
      <main className="flex-1 relative">
        <MapView
          source={source}
          destination={destination}
          mode={mode}
          onRouteFound={handleRouteFound}
          onRouteError={handleRouteError}
        />
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
