import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Search } from 'lucide-react';

export default function SearchPanel({ onSourceSelect, onDestinationSelect }) {
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);
  const [sourceSelected, setSourceSelected] = useState(false);
  const [destSelected, setDestSelected] = useState(false);

  const sourceAbortController = useRef(null);
  const destAbortController = useRef(null);
  const sourceDebounceTimer = useRef(null);
  const destDebounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (sourceAbortController.current) sourceAbortController.current.abort();
      if (destAbortController.current) destAbortController.current.abort();
      if (sourceDebounceTimer.current) clearTimeout(sourceDebounceTimer.current);
      if (destDebounceTimer.current) clearTimeout(destDebounceTimer.current);
    };
  }, []);

  const searchLocation = async (query, isSource) => {
    if (!query || query.length < 2) {
      if (isSource) {
        setSourceResults([]);
      } else {
        setDestResults([]);
      }
      return;
    }

    const abortController = new AbortController();
    if (isSource) {
      if (sourceAbortController.current) {
        sourceAbortController.current.abort();
      }
      sourceAbortController.current = abortController;
      setIsSourceLoading(true);
    } else {
      if (destAbortController.current) {
        destAbortController.current.abort();
      }
      destAbortController.current = abortController;
      setIsDestLoading(true);
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `limit=5&countrycodes=in&addressdetails=1`,
        {
          headers: { 'Accept': 'application/json' },
          signal: abortController.signal,
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      if (isSource) {
        setSourceResults(data);
        setIsSourceLoading(false);
      } else {
        setDestResults(data);
        setIsDestLoading(false);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      if (isSource) {
        setSourceResults([]);
        setIsSourceLoading(false);
      } else {
        setDestResults([]);
        setIsDestLoading(false);
      }
    }
  };

  useEffect(() => {
    if (sourceDebounceTimer.current) {
      clearTimeout(sourceDebounceTimer.current);
    }

    if (!sourceQuery || sourceSelected) {
      setSourceResults([]);
      setIsSourceLoading(false);
      return;
    }

    sourceDebounceTimer.current = setTimeout(() => {
      searchLocation(sourceQuery, true);
    }, 400);

    return () => {
      if (sourceDebounceTimer.current) {
        clearTimeout(sourceDebounceTimer.current);
      }
    };
  }, [sourceQuery, sourceSelected]);

  useEffect(() => {
    if (destDebounceTimer.current) {
      clearTimeout(destDebounceTimer.current);
    }

    if (!destQuery || destSelected) {
      setDestResults([]);
      setIsDestLoading(false);
      return;
    }

    destDebounceTimer.current = setTimeout(() => {
      searchLocation(destQuery, false);
    }, 400);

    return () => {
      if (destDebounceTimer.current) {
        clearTimeout(destDebounceTimer.current);
      }
    };
  }, [destQuery, destSelected]);

  const handleSourceSelect = (result) => {
    const locationName = result.display_name.split(',')[0];
    setSourceQuery(locationName);
    setSourceResults([]);
    setSourceSelected(true);
    onSourceSelect(result);
  };

  const handleDestSelect = (result) => {
    const locationName = result.display_name.split(',')[0];
    setDestQuery(locationName);
    setDestResults([]);
    setDestSelected(true);
    onDestinationSelect(result);
  };

  const clearSource = () => {
    setSourceQuery('');
    setSourceResults([]);
    setSourceSelected(false);
    if (sourceAbortController.current) {
      sourceAbortController.current.abort();
    }
  };

  const clearDest = () => {
    setDestQuery('');
    setDestResults([]);
    setDestSelected(false);
    if (destAbortController.current) {
      destAbortController.current.abort();
    }
  };

  const handleSourceInputChange = (e) => {
    setSourceQuery(e.target.value);
    setSourceSelected(false);
  };

  const handleDestInputChange = (e) => {
    setDestQuery(e.target.value);
    setDestSelected(false);
  };

  return (
    <div className="space-y-4">
      {/* Source Input */}
      <div className="relative">
        <label className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
          <MapPin size={12} className="inline mr-1" />
          From
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            value={sourceQuery}
            onChange={handleSourceInputChange}
            placeholder="Enter starting point..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-all text-sm bg-white shadow-sm"
            autoComplete="off"
          />
          {sourceQuery && (
            <button
              onClick={clearSource}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors z-10"
            >
              <X size={16} />
            </button>
          )}
          {isSourceLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="animate-spin text-blue-500" size={16} />
            </div>
          )}
        </div>

        {/* Source Results Dropdown */}
        {sourceResults.length > 0 && !sourceSelected && (
          <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-blue-200 max-h-56 overflow-y-auto">
            {sourceResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSourceSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
              >
                <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.display_name.split(',').slice(1, 3).join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Input */}
      <div className="relative">
        <label className="block text-xs font-bold text-red-600 mb-2 uppercase tracking-wide">
          <MapPin size={12} className="inline mr-1" />
          To
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            value={destQuery}
            onChange={handleDestInputChange}
            placeholder="Enter destination..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:outline-none transition-all text-sm bg-white shadow-sm"
            autoComplete="off"
          />
          {destQuery && (
            <button
              onClick={clearDest}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors z-10"
            >
              <X size={16} />
            </button>
          )}
          {isDestLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="animate-spin text-red-500" size={16} />
            </div>
          )}
        </div>

        {/* Destination Results Dropdown */}
        {destResults.length > 0 && !destSelected && (
          <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-red-200 max-h-56 overflow-y-auto">
            {destResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleDestSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
              >
                <MapPin size={14} className="text-red-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.display_name.split(',').slice(1, 3).join(', ')}
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
