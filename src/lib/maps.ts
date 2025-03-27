
// Mock implementation of Google Maps services
// In Phase 2, we'll replace this with actual Google Maps API integration

interface LatLng {
  lat: number;
  lng: number;
}

export const calculateDistance = (origin: LatLng, destination: LatLng): number => {
  // Calculate distance in kilometers between two points using Haversine formula
  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

export const calculateETA = (origin: LatLng, destination: LatLng): number => {
  // Estimate travel time in minutes
  // Average speed assumed to be 25 km/h in urban areas
  const distance = calculateDistance(origin, destination);
  const averageSpeedKmH = 25;
  
  // Convert to minutes
  return Math.round((distance / averageSpeedKmH) * 60);
};

export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
  // In a real implementation, this would call the Google Geocoding API
  // For now, return a mock location in Koparkhairne
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return a random location in Koparkhairne area
  const baseLat = 19.1030;
  const baseLng = 73.0148;
  
  return {
    lat: baseLat + (Math.random() - 0.5) * 0.01,
    lng: baseLng + (Math.random() - 0.5) * 0.01,
  };
};

export const reverseGeocode = async (latLng: LatLng): Promise<string> => {
  // In a real implementation, this would call the Google Reverse Geocoding API
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return "Mock Address in Koparkhairne, Navi Mumbai";
};

// Helper function to convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Map component configuration
export const mapConfig = {
  defaultCenter: {
    lat: 19.1030,
    lng: 73.0148,
  },
  defaultZoom: 14,
  mapId: 'mock-map-id',
};

// Function to load Google Maps script (to be implemented in Phase 2)
export const loadGoogleMapsScript = async (): Promise<void> => {
  // In actual implementation, this would load the Google Maps JavaScript API
  // For now, just return a resolved promise after a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Mock Google Maps script loaded');
};
