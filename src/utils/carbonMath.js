// Updated emission factors based on real-world data
// Source: UK Government GHG Conversion Factors 2024
export const EMISSION_FACTORS = {
  "driving-car": 171,        // g CO2/km - Average petrol car (personal vehicle)
  "driving-hgv": 104,        // g CO2/km - Bus/Public transport (per passenger)
  "foot-walking": 41,        // g CO2/km - Train/Metro (electric rail, per passenger)
};

// Descriptive names for each mode
export const MODE_NAMES = {
  "driving-car": "Private Car",
  "driving-hgv": "Public Bus",
  "foot-walking": "Train/Metro",
};

// Industry standard: A mature tree absorbs ~21kg of CO2 per YEAR
const TREE_YEARLY_ABSORPTION = 21;

/**
 * Validates numeric input to prevent calculation errors
 */
const validateNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 ? num : defaultValue;
};

/**
 * Calculates carbon footprint for a trip
 * @param {number} distanceInKm - Distance in kilometers
 * @param {string} mode - Transport mode
 * @returns {number} CO2 emissions in kg
 */
export const calculateCarbon = (distanceInKm, mode) => {
  const validDistance = validateNumber(distanceInKm);
  if (validDistance === 0) return 0;

  const factor = EMISSION_FACTORS[mode] ?? EMISSION_FACTORS["driving-car"];
  const grams = validDistance * factor;
  return parseFloat((grams / 1000).toFixed(2)); // Returns as number for easier math
};

/**
 * Calculates tree offset based on YEARLY absorption
 * @param {number} kgCO2 - CO2 in kilograms
 * @returns {number} Number of trees' yearly work equivalent
 */
export const calculateTreeOffset = (kgCO2) => {
  const validCO2 = validateNumber(kgCO2);
  if (validCO2 <= 0) return 0;
  
  return parseFloat((validCO2 / TREE_YEARLY_ABSORPTION).toFixed(2));
};

/**
 * Calculates potential savings compared to a private car
 * @param {number} distanceInKm - Distance in kilometers
 * @param {string} currentMode - Current transport mode
 * @returns {number} CO2 savings in kg
 */
export const calculateSavings = (distanceInKm, currentMode) => {
  const validDistance = validateNumber(distanceInKm);
  if (validDistance === 0) return 0;

  // We use private car as baseline
  const carEmissions = (validDistance * EMISSION_FACTORS["driving-car"]) / 1000;
  
  if (currentMode === "driving-car") return 0;

  const currentEmissions = calculateCarbon(validDistance, currentMode);
  return parseFloat((carEmissions - currentEmissions).toFixed(2));
};

/**
 * Calculate percentage of emissions saved compared to private car
 * @param {number} distanceInKm - Distance in kilometers
 * @param {string} currentMode - Current transport mode
 * @returns {number} Percentage saved (0-100)
 */
export const calculateSavingsPercentage = (distanceInKm, currentMode) => {
  const validDistance = validateNumber(distanceInKm);
  if (validDistance === 0 || currentMode === "driving-car") return 0;

  const carEmissions = EMISSION_FACTORS["driving-car"];
  const currentFactor = EMISSION_FACTORS[currentMode] ?? carEmissions;
  
  const percentage = ((carEmissions - currentFactor) / carEmissions) * 100;
  return parseFloat(Math.max(0, percentage).toFixed(1));
};

/**
 * Formats carbon emissions with appropriate unit
 * @param {number} kgCO2 - CO2 in kilograms
 * @returns {string} Formatted string with unit
 */
export const formatEmissions = (kgCO2) => {
  const validCO2 = validateNumber(kgCO2);
  
  if (validCO2 < 0.01) return '0 g';
  if (validCO2 < 1) return `${(validCO2 * 1000).toFixed(0)} g`;
  return `${validCO2.toFixed(2)} kg`;
};

/**
 * Get emission factor description for a given mode
 * @param {string} mode - Transport mode
 * @returns {object} Description object with factor and label
 */
export const getEmissionInfo = (mode) => {
  const factor = EMISSION_FACTORS[mode] ?? EMISSION_FACTORS["driving-car"];
  
  return {
    factor,
    label: MODE_NAMES[mode] || "Unknown",
    isEcoFriendly: mode !== "driving-car",
    description: getTransportDescription(mode)
  };
};

/**
 * Get detailed description of transport mode
 * @param {string} mode - Transport mode
 * @returns {string} Description
 */
const getTransportDescription = (mode) => {
  const descriptions = {
    "driving-car": "Personal vehicle - highest emissions per passenger",
    "driving-hgv": "Shared public transport - 39% lower emissions than private car",
    "foot-walking": "Electric rail transport - 76% lower emissions than private car"
  };
  
  return descriptions[mode] || "Unknown transport mode";
};

/**
 * Calculate equivalent comparisons for saved CO2
 * @param {number} kgCO2 - CO2 in kilograms
 * @returns {object} Various equivalents
 */
export const getEquivalents = (kgCO2) => {
  const validCO2 = validateNumber(kgCO2);
  
  return {
    smartphones: Math.floor(validCO2 * 100), // 1kg CO2 = ~100 smartphone charges
    trees: calculateTreeOffset(validCO2),
    miles: (validCO2 / 0.411).toFixed(1), // 1 mile driven = ~411g CO2
    lightbulbs: Math.floor(validCO2 * 120), // 1kg CO2 = ~120 hours of LED bulb
    flights: (validCO2 / 90).toFixed(2), // Short flight = ~90kg CO2
  };
};
