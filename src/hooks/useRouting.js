const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImU5NWEwMGY5ZWI4ZTRkZGRiMmM0YjQ0YTJjZGE2MWJhIiwiaCI6Im11cm11cjY0In0='; // Replace with your key

export const fetchRoute = async (start, end) => {
  // start and end are [lon, lat]
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.join(',')}&end=${end.join(',')}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  // ORS returns coordinates as [lon, lat], Leaflet needs [lat, lon]
  const points = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
  const distance = data.features[0].properties.summary.distance / 1000; // to km
  
  return { points, distance };
};