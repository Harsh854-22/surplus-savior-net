
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FoodListing } from '@/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapView } from '@/components/MapView';
import { FoodCard } from '@/components/FoodCard';
import { MapPin, Filter, Search, CalendarClock, AlertTriangle } from 'lucide-react';

const AvailableForVolunteer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  // Get current volunteer location
  useEffect(() => {
    if (user && user.location) {
      setUserLocation(user.location);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access Required",
            description: "We need your location to show nearby food listings",
            variant: "destructive",
          });
        }
      );
    }
  }, [user, toast]);

  // Fetch all available food listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['availableFoodListings'],
    queryFn: async () => {
      // If we have user location, get nearby listings
      if (userLocation) {
        try {
          // Get food listings within 10km
          return await db.foodListings.getNearby(userLocation.lat, userLocation.lng, 10);
        } catch (error) {
          console.error("Error fetching nearby listings:", error);
          return [];
        }
      } else {
        // Fallback to all listings
        const allListings = await db.foodListings.getAll();
        return allListings.filter(listing => listing.status === 'available');
      }
    },
    enabled: !!userLocation,
  });

  // Filter listings based on search query
  const filteredListings = listings?.filter(listing => 
    listing.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Sort listings based on selected criteria
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'expiry') {
      return a.expiryTime - b.expiryTime; // Soonest expiry first
    } else if (sortBy === 'quantity') {
      return b.quantity - a.quantity; // Highest quantity first
    } else {
      // Default: sort by distance (if we have user location)
      if (!userLocation) return 0;
      
      const distanceA = Math.sqrt(
        Math.pow(a.location.lat - userLocation.lat, 2) + 
        Math.pow(a.location.lng - userLocation.lng, 2)
      );
      
      const distanceB = Math.sqrt(
        Math.pow(b.location.lat - userLocation.lat, 2) + 
        Math.pow(b.location.lng - userLocation.lng, 2)
      );
      
      return distanceA - distanceB;
    }
  });

  // Handle claim button click
  const handleClaimFood = (listing: FoodListing) => {
    navigate(`/food/${listing.id}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Available Food For Delivery</h1>
        <p className="text-muted-foreground">
          View and claim available food listings for pickup and delivery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, location..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Nearest First</SelectItem>
                    <SelectItem value="expiry">Expiring Soon</SelectItem>
                    <SelectItem value="quantity">Largest Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/volunteer/schedule')}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                View Your Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Map View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Food Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden border aspect-square">
                <MapView 
                  listings={sortedListings}
                  currentLocation={userLocation}
                  destination={selectedListing?.location}
                  showDirections={!!selectedListing}
                  onMarkerClick={setSelectedListing}
                />
              </div>
              {selectedListing && (
                <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedListing.foodName}</p>
                    <p className="text-sm text-muted-foreground">{selectedListing.hotelName}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/food/${selectedListing.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Food Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Food</h2>
            <Badge className="px-2 py-1">
              {sortedListings.length} Available
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedListings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="mb-4">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Food Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no food listings available in your area.
                </p>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Refresh
                  </Button>
                  <Button onClick={() => navigate('/volunteer/schedule')}>
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedListings.map((listing) => (
                <div key={listing.id} onClick={() => setSelectedListing(listing)}>
                  <FoodCard
                    listing={listing}
                    onClaim={() => handleClaimFood(listing)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableForVolunteer;
