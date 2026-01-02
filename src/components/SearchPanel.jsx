import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, AlertCircle, Navigation2 } from "lucide-react";

export default function SearchPanel({
  onLocationSelect,
  placeholder = "Search location...",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeout = useRef(null);
  const abortController = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (abortController.current) abortController.current.abort();
    };
  }, []);

  const handleSearch = (val) => {
    const sanitized = val.trim().replace(/[<>]/g, '');
    setQuery(sanitized);
    setError(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (abortController.current) abortController.current.abort();

    if (sanitized.length > 2) {
      searchTimeout.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          abortController.current = new AbortController();
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sanitized)}&limit=5&addressdetails=1`,
            {
              signal: abortController.current.signal,
              headers: {
                'Accept-Language': 'en'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.length === 0) {
            setError('No locations found. Try a different search term.');
          }
          
          setResults(data);
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Search request cancelled');
            return;
          }
          
          console.error("Search error:", error);
          setError('Search failed. Please check your connection and try again.');
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 400);
    } else {
      setResults([]);
      if (sanitized.length > 0 && sanitized.length <= 2) {
        setError('Please type at least 3 characters');
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (abortController.current) abortController.current.abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setResults([]);
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full group">
      <div className="relative flex items-center">
        {/* Animated Border Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-xl opacity-0 blur-sm transition-opacity duration-300 ${
          isFocused ? 'opacity-30' : ''
        }`}></div>

        <div className={`relative flex items-center w-full transition-all duration-300 ${
          isFocused ? 'scale-[1.02]' : ''
        }`}>
          {/* Search Icon with Animation */}
          <div className={`absolute left-3 flex items-center pointer-events-none transition-all duration-300 ${
            isFocused ? 'text-green-600 scale-110' : 'text-slate-400'
          }`}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
          </div>

          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 lg:py-2.5 
                       bg-white/70 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl 
                       focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-400 
                       outline-none text-base lg:text-sm transition-all duration-300 
                       placeholder:text-slate-400 text-slate-700 font-medium
                       shadow-sm hover:shadow-md focus:shadow-lg"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            aria-label={placeholder}
            autoComplete="off"
          />

          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 lg:right-3 p-2 lg:p-1.5 rounded-full 
                         bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 
                         transition-all duration-200 active:scale-90 group/clear"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 lg:h-3.5 lg:w-3.5 group-hover/clear:rotate-90 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message with Enhanced Design */}
      {error && (
        <div className="mt-2 p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2 shadow-sm">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Results Dropdown with Enhanced Animations */}
      {results.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-[40]"
            onClick={() => setResults([])}
          />

          <div
            className="absolute w-full mt-2 bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 
                        rounded-2xl shadow-2xl z-[9999] overflow-hidden 
                        animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300"
          >
            <div className="py-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {results.map((item, index) => (
                <button
                  key={item.place_id}
                  onClick={() => {
                    onLocationSelect(item);
                    setResults([]);
                    setQuery(item.display_name);
                  }}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="w-full px-4 py-3.5 lg:py-3 text-left 
                             hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 
                             active:bg-green-100 flex items-start gap-3 
                             transition-all duration-200 border-b border-slate-50/50 last:border-none 
                             group/item animate-in slide-in-from-left-4"
                >
                  {/* Icon Container with Glow Effect */}
                  <div className="relative mt-0.5">
                    <div className="absolute inset-0 bg-green-400 rounded-lg blur-md opacity-0 group-hover/item:opacity-30 transition-opacity"></div>
                    <div className="relative p-2 lg:p-1.5 bg-gradient-to-br from-slate-100 to-slate-50 
                                    group-hover/item:from-green-100 group-hover/item:to-emerald-100 
                                    rounded-lg transition-all duration-200 shadow-sm 
                                    group-hover/item:shadow-md group-hover/item:scale-110 shrink-0">
                      <MapPin
                        size={16}
                        className="text-slate-500 group-hover/item:text-green-600 
                                   lg:w-3.5 lg:h-3.5 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                    <span className="font-bold text-slate-700 truncate text-base lg:text-sm 
                                     group-hover/item:text-green-700 transition-colors">
                      {item.display_name.split(",")[0]}
                    </span>
                    <span className="text-xs lg:text-[11px] text-slate-400 truncate 
                                     group-hover/item:text-slate-500 transition-colors">
                      {item.display_name.split(",").slice(1).join(",")}
                    </span>
                  </div>

                  {/* Hover Arrow */}
                  <Navigation2 
                    size={14} 
                    className="opacity-0 group-hover/item:opacity-100 
                               text-green-500 transition-all duration-200 
                               group-hover/item:translate-x-1 mt-1 shrink-0" 
                  />
                </button>
              ))}
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-slate-50 to-green-50/30 px-4 py-2.5 border-t border-slate-100/50 hidden lg:block">
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider text-center flex items-center justify-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Press Esc to close
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
