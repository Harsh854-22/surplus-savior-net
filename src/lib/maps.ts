
// Google Maps API integration

interface LatLng {
  lat: number;
  lng: number;
}

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDHC0ImQ3BtT7Ha0g6DTHIGP45fmPcb4bM';

// Calculate distance between two points using Google Maps Distance Matrix API
export const calculateDistance = async (origin: LatLng, destination: LatLng): Promise<number> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch distance from Google Maps API');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]?.distance?.value) {
      console.error('Invalid distance matrix response:', data);
      // Fallback to Haversine formula if API fails
      return calculateHaversineDistance(origin, destination);
    }
    
    // Convert meters to kilometers
    return data.rows[0].elements[0].distance.value / 1000;
  } catch (error) {
    console.error('Error calculating distance with Google Maps API:', error);
    // Fallback to Haversine formula
    return calculateHaversineDistance(origin, destination);
  }
};

// Calculate ETA using Google Maps Duration API
export const calculateETA = async (origin: LatLng, destination: LatLng): Promise<number> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch ETA from Google Maps API');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]?.duration?.value) {
      console.error('Invalid duration matrix response:', data);
      // Fallback to estimation based on distance
      const distance = await calculateDistance(origin, destination);
      return estimateETAFromDistance(distance);
    }
    
    // Convert seconds to minutes and round
    return Math.round(data.rows[0].elements[0].duration.value / 60);
  } catch (error) {
    console.error('Error calculating ETA with Google Maps API:', error);
    // Fallback to estimation based on distance
    const distance = await calculateDistance(origin, destination);
    return estimateETAFromDistance(distance);
  }
};

// Geocode address to coordinates using Google Geocoding API
export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to geocode address with Google Maps API');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
      console.error('Invalid geocoding response:', data);
      return null;
    }
    
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  } catch (error) {
    console.error('Error geocoding address with Google Maps API:', error);
    return null;
  }
};

// Reverse geocode coordinates to address using Google Reverse Geocoding API
export const reverseGeocode = async (latLng: LatLng): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng.lat},${latLng.lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to reverse geocode with Google Maps API');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.[0]?.formatted_address) {
      console.error('Invalid reverse geocoding response:', data);
      return "Address not found";
    }
    
    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Error reverse geocoding with Google Maps API:', error);
    return "Address not found";
  }
};

// Helper function to calculate distance using Haversine formula (as fallback)
function calculateHaversineDistance(origin: LatLng, destination: LatLng): number {
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
}

// Helper function to estimate ETA based on distance (as fallback)
function estimateETAFromDistance(distance: number): number {
  // Average speed assumed to be 25 km/h in urban areas
  const averageSpeedKmH = 25;
  
  // Convert to minutes
  return Math.round((distance / averageSpeedKmH) * 60);
}

// Helper function to convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Map component configuration for Koparkhairne, Navi Mumbai
export const mapConfig = {
  defaultCenter: {
    lat: 19.1030,
    lng: 73.0148,
  },
  defaultZoom: 14,
  apiKey: GOOGLE_MAPS_API_KEY,
};

// Function to load Google Maps script
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      console.log('Google Maps script already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });
};
