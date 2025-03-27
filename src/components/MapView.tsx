
import React, { useEffect, useRef, useState } from 'react';
import { FoodListing } from '@/types';
import { mapConfig, loadGoogleMapsScript } from '@/lib/maps';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation } from 'lucide-react';

interface MapViewProps {
  listings?: FoodListing[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
  onMarkerClick?: (listing: FoodListing) => void;
  zoom?: number;
  showDirections?: boolean;
  destination?: {
    lat: number;
    lng: number;
  };
}

export const MapView: React.FC<MapViewProps> = ({
  listings = [],
  currentLocation,
  onMarkerClick,
  zoom = mapConfig.defaultZoom,
  showDirections = false,
  destination,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        setMapLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    // Create the map instance
    const center = currentLocation || mapConfig.defaultCenter;
    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    // Create directions renderer if showing directions
    if (showDirections) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
    }

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Clear info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Clear directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [mapLoaded, currentLocation, zoom, showDirections]);

  // Add markers for food listings
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || listings.length === 0) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each listing
    listings.forEach(listing => {
      if (!listing.location || !mapRef.current) return;

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: listing.location.lat, lng: listing.location.lng },
        map: mapRef.current,
        title: listing.foodName,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing);
        } else if (infoWindowRef.current) {
          // Show info window if no click handler provided
          const content = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-weight: 600;">${listing.foodName}</h3>
              <p style="margin: 0 0 8px;">${listing.hotelName}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${listing.quantity} ${listing.quantityUnit}
              </p>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });

      // Store marker reference
      markersRef.current.push(marker);
    });
  }, [mapLoaded, listings, onMarkerClick]);

  // Add marker for current location
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !currentLocation) return;

    // Create marker for current location
    const marker = new google.maps.Marker({
      position: currentLocation,
      map: mapRef.current,
      title: 'Your Location',
      animation: google.maps.Animation.BOUNCE,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      }
    });

    // Add to markers array for cleanup
    markersRef.current.push(marker);

    // Center map on current location
    mapRef.current.setCenter(currentLocation);

    return () => {
      marker.setMap(null);
    };
  }, [mapLoaded, currentLocation]);

  // Show directions between current location and destination
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !currentLocation || !destination || !showDirections || !directionsRendererRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Error getting directions:', status);
        }
      }
    );
  }, [mapLoaded, currentLocation, destination, showDirections]);

  return (
    <div className="rounded-lg overflow-hidden border border-border h-[300px] md:h-[400px] bg-accent relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      ) : !mapLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-4">
          <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Unable to load Google Maps. Please check your internet connection and try again.
          </p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="h-full w-full"></div>
      )}
      
      {/* Map footer with attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-white/80 px-1 rounded">
        Map data © {new Date().getFullYear()} Google
      </div>
    </div>
  );
};
