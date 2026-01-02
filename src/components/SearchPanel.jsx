import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Search } from 'lucide-react';

export default function SearchPanel({ onSourceSelect, onDestinationSelect }) {
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);
  const [sourceError, setSourceError] = useState(null);
  const [destError, setDestError] = useState(null);

  const sourceAbortController = useRef(null);
  const destAbortController = useRef(null);
  const sourceDebounceTimer = useRef(null);
  const destDebounceTimer = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceAbortController.current) sourceAbortController.current.abort();
      if (destAbortController.current) destAbortController.current.abort();
      if (sourceDebounceTimer.current) clearTimeout(sourceDebounceTimer.current);
      if (destDebounceTimer.current) clearTimeout(destDebounceTimer.current);
    };
  }, []);

  // Search function with proper abort handling
  const searchLocation = async (query, isSource) => {
    if (!query || query.length < 2) {
      if (isSource) {
        setSourceResults([]);
        setSourceError(null);
      } else {
        setDestResults([]);
        setDestError(null);
      }
      return;
    }

    // Abort previous request
    const abortController = new AbortController();
    if (isSource) {
      if (sourceAbortController.current) {
        sourceAbortController.current.abort();
      }
      sourceAbortController.current = abortController;
      setIsSourceLoading(true);
      setSourceError(null);
    } else {
      if (destAbortController.current) {
        destAbortController.current.abort();
      }
      destAbortController.current = abortController;
      setIsDestLoading(true);
      setDestError(null);
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `limit=5&countrycodes=in&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (isSource) {
        setSourceResults(data);
        setIsSourceLoading(false);
      } else {
        setDestResults(data);
        setIsDestLoading(false);
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Search error:', err);
      
      if (isSource) {
        setSourceError('Search failed. Please try again.');
        setSourceResults([]);
        setIsSourceLoading(false);
      } else {
        setDestError('Search failed. Please try again.');
        setDestResults([]);
        setIsDestLoading(false);
      }
    }
  };

  // Debounced search for source
  useEffect(() => {
    if (sourceDebounceTimer.current) {
      clearTimeout(sourceDebounceTimer.current);
    }

    if (!sourceQuery) {
      setSourceResults([]);
      setIsSourceLoading(false);
      return;
    }

    sourceDebounceTimer.current = setTimeout(() => {
      searchLocation(sourceQuery, true);
    }, 600); // 600ms debounce

    return () => {
      if (sourceDebounceTimer.current) {
        clearTimeout(sourceDebounceTimer.current);
      }
    };
  }, [sourceQuery]);

  // Debounced search for destination
  useEffect(() => {
    if (destDebounceTimer.current) {
      clearTimeout(destDebounceTimer.current);
    }

    if (!destQuery) {
      setDestResults([]);
      setIsDestLoading(false);
      return;
    }

    destDebounceTimer.current = setTimeout(() => {
      searchLocation(destQuery, false);
    }, 600); // 600ms debounce

    return () => {
      if (destDebounceTimer.current) {
        clearTimeout(destDebounceTimer.current);
      }
    };
  }, [destQuery]);

  const handleSourceSelect = (result) => {
    setSourceQuery(result.display_name.split(',')[0]);
    setSourceResults([]);
    onSourceSelect(result);
  };

  const handleDestSelect = (result) => {
    setDestQuery(result.display_name.split(',')[0]);
    setDestResults([]);
    onDestinationSelect(result);
  };

  const clearSource = () => {
    setSourceQuery('');
    setSourceResults([]);
    setSourceError(null);
    if (sourceAbortController.current) {
      sourceAbortController.current.abort();
    }
  };

  const clearDest = () => {
    setDestQuery('');
    setDestResults([]);
    setDestError(null);
    if (destAbortController.current) {
      destAbortController.current.abort();
    }
  };

  return (
    <div className="space-y-4">
      {/* Source Input */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
          <MapPin size={12} className="inline mr-1" />
          From
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={sourceQuery}
            onChange={(e) => setSourceQuery(e.target.value)}
            placeholder="Enter starting point..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none transition-all text-sm bg-white/80 backdrop-blur-sm"
          />
          {sourceQuery && (
            <button
              onClick={clearSource}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          {isSourceLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-green-500" size={18} />
            </div>
          )}
        </div>

        {/* Source Error */}
        {sourceError && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
            {sourceError}
          </div>
        )}

        {/* Source Results */}
        {sourceResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-200 max-h-64 overflow-y-auto custom-scrollbar">
            {sourceResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSourceSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
              >
                <MapPin size={16} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.display_name.split(',').slice(1).join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Input */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
          <MapPin size={12} className="inline mr-1" />
          To
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            placeholder="Enter destination..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none transition-all text-sm bg-white/80 backdrop-blur-sm"
          />
          {destQuery && (
            <button
              onClick={clearDest}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          {isDestLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-red-500" size={18} />
            </div>
          )}
        </div>

        {/* Destination Error */}
        {destError && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
            {destError}
          </div>
        )}

        {/* Destination Results */}
        {destResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-200 max-h-64 overflow-y-auto custom-scrollbar">
            {destResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleDestSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
              >
                <MapPin size={16} className="text-red-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.display_name.split(',').slice(1).join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
