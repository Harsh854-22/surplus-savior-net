
import React, { useEffect, useRef, useState } from 'react';
import { FoodListing } from '@/types';
import { mapConfig } from '@/lib/maps';
import { Badge } from '@/components/ui/badge';

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

  // In a real implementation, we would use the Google Maps JavaScript API
  // This is just a placeholder that shows a static map image
  
  useEffect(() => {
    // Simulate loading the map
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-border h-[300px] md:h-[400px] bg-accent relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="flex space-x-2">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      ) : (
        <div ref={mapContainerRef} className="h-full w-full relative">
          {/* Mock map display with data points */}
          <div className="h-full w-full bg-[#f0f4f8] flex items-center justify-center relative">
            <div className="absolute inset-0">
              {/* Add grid lines to simulate a map */}
              <div className="w-full h-full" style={{ 
                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }}>
                
                {/* Add some roads */}
                <div className="absolute top-1/3 left-0 right-0 h-3 bg-gray-200"></div>
                <div className="absolute top-2/3 left-0 right-0 h-2 bg-gray-200"></div>
                <div className="absolute left-1/4 top-0 bottom-0 w-3 bg-gray-200"></div>
                <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-200"></div>
              </div>
            </div>
            
            {/* Current location marker */}
            {currentLocation && (
              <div 
                className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ 
                  left: '50%', 
                  top: '50%', 
                }}
              ></div>
            )}
            
            {/* Food listing markers */}
            {listings.map((listing, index) => {
              // Position markers somewhat randomly around the center
              const offsetX = (((index * 29) % 100) - 50) / 100;
              const offsetY = (((index * 37) % 100) - 50) / 100;
              
              return (
                <div 
                  key={listing.id}
                  className="absolute cursor-pointer"
                  style={{ 
                    left: `calc(50% + ${offsetX * 200}px)`, 
                    top: `calc(50% + ${offsetY * 200}px)`, 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                  onClick={() => onMarkerClick?.(listing)}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-md"></div>
                    <div className="mt-1 bg-white px-2 py-1 rounded-md shadow-sm text-xs whitespace-nowrap">
                      {listing.foodName}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Direction line */}
            {showDirections && destination && (
              <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                <svg width="100%" height="100%">
                  <path 
                    d="M 50% 50% L 55% 45% C 60% 40%, 65% 40%, 70% 45% L 75% 50%" 
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            )}
            
            {/* Destination marker */}
            {destination && (
              <div 
                className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: '75%', 
                  top: '50%', 
                }}
              >
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <Badge className="bg-green-500">Destination</Badge>
                </div>
              </div>
            )}
          </div>
          
          {/* Map attribution */}
          <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-white/80 px-1 rounded">
            Map data © 2023
          </div>
        </div>
      )}
    </div>
  );
};
