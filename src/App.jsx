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
      setDistance((prev) => (prev === 0 ? dist : prev));
      setIsLoadingRoute(false);
      setRouteError(null);
    }
  }, []);

  const handleRouteError = useCallback((errorMessage) => {
    setRouteError(errorMessage);
    setDistance(0);
    setIsLoadingRoute(false);
  }, []);

  const handleSourceSelect = (loc) => {
    setSource(loc);
    setDistance(0);
    setRouteError(null);
  };

  const handleDestinationSelect = (loc) => {
    setDestination(loc);
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
      {/* Mobile Header with Enhanced Glassmorphism */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg z-[1001] animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-2 group">
          <div className="relative">
            <Leaf className="text-green-600 animate-pulse" size={24} />
            <Sparkles
              className="absolute -top-1 -right-1 text-yellow-500 animate-ping"
              size={12}
            />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Eco-Route
          </h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl text-slate-700 active:scale-90 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/50"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar with Enhanced Design */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[1000] w-full sm:w-80 lg:w-96 
          bg-white/80 backdrop-blur-2xl shadow-2xl border-r border-white/20
          transform transition-all duration-500 ease-out ${
            isSidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full lg:translate-x-0"
          } flex flex-col p-6 overflow-y-auto custom-scrollbar`}
      >
        {/* Header Section with Trophy */}
        <div className="flex items-center justify-between mb-8 animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Leaf className="text-white" size={28} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                Eco-Route
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Sustainable Travel
              </p>
            </div>
          </div>

          {/* Animated Trophy Badge */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-amber-50 px-4 py-2 rounded-2xl border border-yellow-200/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-default">
              <Trophy
                size={16}
                className="text-yellow-600 animate-bounce-slow"
              />
              <div className="text-right">
                <p className="text-[9px] text-yellow-600/70 font-bold uppercase tracking-wide">
                  Saved
                </p>
                <span className="text-sm font-black text-yellow-700">
                  {totalSaved.toFixed(1)}
                  <span className="text-[10px] font-medium ml-0.5">kg</span>
                </span>
              </div>
              {totalSaved > 0 && (
                <TrendingUp
                  size={12}
                  className="text-green-600 absolute -top-1 -right-1 animate-pulse"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-grow">
          {/* Trip Planning Section */}
          <section className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Navigation size={14} className="text-green-500" />
                Plan Journey
              </h2>
              <div className="flex gap-2">
                {(source || destination) && (
                  <button
                    onClick={resetTrip}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all duration-200 active:scale-90"
                    title="Reset trip"
                    aria-label="Reset trip"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={swapLocations}
                  disabled={!source || !destination}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    source && destination
                      ? "hover:bg-green-50 text-slate-400 hover:text-green-600 active:rotate-180"
                      : "text-slate-200 cursor-not-allowed"
                  }`}
                  title="Swap locations"
                  aria-label="Swap locations"
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>
            </div>

            {/* Location Inputs with Animated Line */}
            <div className="relative space-y-4 bg-gradient-to-br from-slate-50/50 to-white/50 p-4 rounded-2xl border border-slate-100/50 shadow-sm">
              <div className="absolute left-[26px] top-[52px] bottom-[52px] w-0.5 bg-gradient-to-b from-blue-400 via-green-300 to-red-400 animate-pulse-slow"></div>

              <div className="relative z-10 flex items-start gap-3 group">
                <div className="mt-3 relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative h-4 w-4 rounded-full border-3 border-blue-500 bg-white shadow-md group-hover:scale-110 transition-transform"></div>
                </div>
                <div className="flex-1">
                  <SearchPanel
                    placeholder="Starting point..."
                    onLocationSelect={handleSourceSelect}
                  />
                  {source && (
                    <div className="flex items-center gap-1 mt-2 animate-in slide-in-from-left duration-300">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] text-green-600 font-bold truncate">
                        {source.display_name?.split(",")[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex items-start gap-3 group">
                <MapPin
                  className="mt-2.5 text-red-500 shrink-0 group-hover:scale-110 transition-transform drop-shadow-sm"
                  size={18}
                />
                <div className="flex-1">
                  <SearchPanel
                    placeholder="Destination..."
                    onLocationSelect={handleDestinationSelect}
                  />
                  {destination && (
                    <div className="flex items-center gap-1 mt-2 animate-in slide-in-from-left duration-300">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] text-green-600 font-bold truncate">
                        {destination.display_name?.split(",")[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Error Display with Better Animation */}
          {routeError && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 shadow-lg">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={18} className="text-red-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-700 mb-1">
                  Route Error
                </p>
                <p className="text-xs text-red-600 leading-relaxed">
                  {routeError}
                </p>
              </div>
            </div>
          )}

          {/* Transport Mode Selector - Updated with Public Transport */}
          <section className="animate-in fade-in slide-in-from-left-6 duration-700">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Bus size={14} className="text-green-500" />
              Transport Mode
            </h2>
            <div className="grid grid-cols-3 gap-3 p-3 bg-gradient-to-br from-slate-50/50 to-white/50 rounded-2xl border border-slate-100/50">
              {[
                {
                  id: "driving-car",
                  icon: Car,
                  label: "Private Car",
                  gradient: "from-red-500 to-orange-500",
                  desc: "Own Vehicle",
                },
                {
                  id: "driving-hgv",
                  icon: Bus,
                  label: "Public Bus",
                  gradient: "from-blue-500 to-cyan-500",
                  desc: "Bus/Metro",
                },
                {
                  id: "foot-walking",
                  icon: Train,
                  label: "Train",
                  gradient: "from-green-500 to-emerald-500",
                  desc: "Railway",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  disabled={isLoadingRoute}
                  className={`relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    mode === m.id
                      ? `bg-gradient-to-br ${m.gradient} border-transparent text-white shadow-xl shadow-green-200 scale-105`
                      : "bg-white/70 border-slate-200/50 text-slate-400 hover:border-green-300 hover:bg-green-50/50 hover:text-green-600 hover:scale-105 active:scale-95"
                  } ${isLoadingRoute ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={`Select ${m.label} mode`}
                >
                  {mode === m.id && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                  )}
                  <m.icon
                    size={24}
                    className={
                      mode === m.id
                        ? "animate-bounce-slow"
                        : "group-hover:scale-110 transition-transform"
                    }
                  />
                  <span className="text-[10px] font-black mt-2 uppercase tracking-tight">
                    {m.label}
                  </span>
                  <span
                    className={`text-[8px] mt-0.5 font-medium ${
                      mode === m.id ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {m.desc}
                  </span>
                  {mode === m.id && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full border-2 border-white animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Impact Analysis Section */}
          {(source || destination) && (
            <section className="animate-in fade-in zoom-in-95 duration-500">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                Impact Analysis
              </h2>
              {distance > 0 ? (
                <ImpactCard distance={distance} mode={mode} />
              ) : source && destination && !routeError ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-gradient-to-br from-slate-50/50 to-white/50 rounded-2xl border border-slate-100/50">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute top-0 h-12 w-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest animate-pulse">
                      Calculating route
                    </p>
                    <div className="flex gap-1 justify-center">
                      <div
                        className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </div>

        <footer className="mt-auto pt-6 text-[10px] text-slate-400 text-center border-t border-slate-100/50 italic space-y-1">
          <p className="font-semibold">Sustainable Transit Tracker</p>
          <p className="text-slate-300">Version 2.0 • Made with 💚</p>
        </footer>
      </aside>

      {/* Main Map */}
      <main className="flex-1 relative z-0 h-[65vh] lg:h-full transition-all duration-500">
        <MapView
          source={source}
          destination={destination}
          mode={mode}
          onRouteFound={handleRouteFound}
          onRouteError={handleRouteError}
        />

        {/* Floating Toggle Button - Enhanced */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] 
              bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-full 
              shadow-2xl flex items-center gap-3 font-bold text-sm transition-all 
              hover:shadow-slate-900/50 active:scale-95 
              animate-in slide-in-from-bottom-8 duration-500
              border border-white/10 backdrop-blur-sm"
            aria-label="View statistics"
          >
            <Navigation size={18} className="rotate-45 animate-pulse" />
            <span>View Stats</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl"></div>
          </button>
        )}
      </main>

      {/* Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}

export default App;
