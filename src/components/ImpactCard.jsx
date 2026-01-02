import React, { useMemo } from "react";
import {
  Car,
  Leaf,
  Trees,
  Info,
  TrendingDown,
  Zap,
  Award,
  Heart,
  Bus,
  Train,
} from "lucide-react";
import { calculateSavingsPercentage, MODE_NAMES } from "../utils/carbonMath";

export default function ImpactCard({ distance, mode }) {
  if (!distance || distance <= 0) return null;

  // Emission factors (g CO2/km per passenger)
  const EMISSION_FACTORS = {
    "driving-car": 171, // Private car
    "driving-hgv": 104, // Public bus
    "foot-walking": 41, // Train/Metro
  };

  const TREE_YEARLY_ABSORPTION = 21;

  const calculations = useMemo(() => {
    const isEcoMode = mode !== "driving-car";
    const carImpact = (distance * EMISSION_FACTORS["driving-car"]) / 1000; // kg CO2
    const currentFactor =
      EMISSION_FACTORS[mode] ?? EMISSION_FACTORS["driving-car"];
    const tripCO2 = (distance * currentFactor) / 1000;
    const savedCO2 = isEcoMode ? carImpact - tripCO2 : 0;
    const yearlyTrees = (savedCO2 / TREE_YEARLY_ABSORPTION).toFixed(2);
    const savingsPercentage = calculateSavingsPercentage(distance, mode);

    return {
      isEcoMode,
      carImpact,
      tripCO2,
      savedCO2,
      yearlyTrees,
      savingsPercentage,
      currentFactor,
    };
  }, [distance, mode]);

  const {
    isEcoMode,
    carImpact,
    tripCO2,
    savedCO2,
    yearlyTrees,
    savingsPercentage,
    currentFactor,
  } = calculations;

  // Get transport icon
  const getTransportIcon = () => {
    switch (mode) {
      case "driving-car":
        return Car;
      case "driving-hgv":
        return Bus;
      case "foot-walking":
        return Train;
      default:
        return Car;
    }
  };

  const TransportIcon = getTransportIcon();
  const modeName = MODE_NAMES[mode] || "Unknown";

  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Base Distance Display with Gradient */}
      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <p className="relative text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 flex items-center gap-2">
            <Zap size={12} className="text-green-400 animate-pulse" />
            Total Route Distance
          </p>
          <h2 className="relative text-5xl font-black italic bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {distance.toFixed(1)}
            <span className="text-xl font-medium text-slate-400 ml-2">
              kilometers
            </span>
          </h2>
        </div>
      </div>

      {/* Savings Percentage Badge - Enhanced */}
      {isEcoMode && savingsPercentage > 0 && (
        <div className="relative group overflow-hidden animate-in slide-in-from-right duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-5 rounded-2xl text-white shadow-2xl flex items-center justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingDown
                  size={28}
                  className="text-white animate-bounce-slow"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-green-100 opacity-90 tracking-wide">
                  CO₂ Reduction
                </p>
                <p className="text-3xl font-black mt-1">{savingsPercentage}%</p>
                <p className="text-[10px] opacity-80 mt-0.5">vs Private Car</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-xs font-semibold opacity-90">You Saved</p>
              <p className="text-2xl font-black mt-1">
                {savedCO2.toFixed(2)} kg
              </p>
              <Award size={16} className="inline-block ml-1 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Impact Comparison Grid - Enhanced */}
      <div className="grid grid-cols-2 gap-4">
        {/* Private Car Emissions */}
        <div
          className="relative group overflow-hidden animate-in slide-in-from-left duration-500"
          style={{ animationDelay: "100ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <Car size={18} className="text-red-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                Private Car
              </p>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {carImpact.toFixed(2)}
              <span className="text-xs font-bold text-slate-400 ml-1">
                kg CO₂
              </span>
            </p>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">
              Baseline emission
            </p>
          </div>
        </div>

        {/* Your Trip Emissions */}
        <div
          className={`relative group overflow-hidden animate-in slide-in-from-right duration-500 ${
            isEcoMode ? "scale-105" : ""
          }`}
          style={{ animationDelay: "200ms" }}
        >
          <div
            className={`absolute inset-0 ${
              isEcoMode
                ? "bg-gradient-to-br from-green-200 to-emerald-200"
                : "bg-gradient-to-br from-slate-100 to-slate-200"
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          ></div>
          <div
            className={`relative p-5 rounded-2xl border-2 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${
              isEcoMode
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                : "bg-white/80 backdrop-blur-sm border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
                  isEcoMode
                    ? "bg-gradient-to-br from-green-100 to-emerald-100"
                    : "bg-slate-50"
                }`}
              >
                <TransportIcon
                  size={18}
                  className={isEcoMode ? "text-green-600" : "text-slate-400"}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {modeName}
              </p>
            </div>
            <p
              className={`text-2xl font-black ${
                isEcoMode ? "text-green-600" : "text-slate-800"
              }`}
            >
              {tripCO2.toFixed(2)}
              <span className="text-xs font-bold text-slate-400 ml-1">
                kg CO₂
              </span>
            </p>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">
              {isEcoMode ? (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  Eco-friendly! <Leaf size={10} className="animate-pulse" />
                </span>
              ) : (
                "Current emission"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 p-4 rounded-2xl">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info size={12} />
          Emission Details
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Emission Factor:</span>
            <span className="text-sm font-black text-blue-700">
              {currentFactor} g/km
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Total Distance:</span>
            <span className="text-sm font-black text-blue-700">
              {distance.toFixed(1)} km
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Your Impact:</span>
            <span className="text-sm font-black text-blue-700">
              {(tripCO2 * 1000).toFixed(0)} grams
            </span>
          </div>
        </div>
      </div>

      {/* Eco Achievement - Enhanced */}
      {isEcoMode && savedCO2 > 0 ? (
        <div className="relative group overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-5 rounded-2xl text-white shadow-2xl flex items-center gap-4 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30 shadow-lg group-hover:rotate-12 transition-transform">
              <Trees size={32} className="text-white animate-bounce-slow" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase text-green-100 opacity-90 mb-1 tracking-wide flex items-center gap-1">
                <Award size={12} className="animate-pulse" />
                Environmental Impact
              </p>
              <p className="text-sm leading-tight font-semibold">
                Your choice saves CO₂ equivalent to{" "}
                <span className="text-lg font-black underline decoration-2 decoration-white/50 bg-white/10 px-2 py-0.5 rounded-lg">
                  {yearlyTrees} tree{parseFloat(yearlyTrees) !== 1 ? "s" : ""}
                </span>{" "}
                absorbing carbon for a full year!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border-2 border-amber-200 flex items-center gap-3 group animate-in fade-in">
          <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            <Info size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 mb-1">
              Switch to Public Transport!
            </p>
            <p className="text-xs text-amber-600 leading-tight">
              Choose <span className="font-black">Bus</span> (39% savings) or{" "}
              <span className="font-black">Train</span> (76% savings) to reduce
              your carbon footprint.
            </p>
          </div>
        </div>
      )}

      {/* Fun Fact Section - Enhanced */}
      {isEcoMode && savedCO2 > 0.5 && (
        <div
          className="relative group overflow-hidden animate-in zoom-in-95 duration-500"
          style={{ animationDelay: "300ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-300 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200/50 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all">
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Did You Know?</span>
            </p>
            <p className="text-xs text-purple-700 leading-relaxed font-medium">
              By choosing {modeName.toLowerCase()}, you've prevented{" "}
              <span className="font-black text-purple-800">
                {(savedCO2 * 1000).toFixed(0)}g
              </span>{" "}
              of CO₂ emissions - that's like planting{" "}
              <span className="font-black text-purple-800">
                {Math.ceil(parseFloat(yearlyTrees) * 10)}
              </span>{" "}
              seedlings! 🌱🌍
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
