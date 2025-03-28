
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { MapView } from '@/components/MapView';
import { FoodCard } from '@/components/FoodCard';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { geocodeAddress } from '@/lib/maps';

const AvailableFood = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [searchAddress, setSearchAddress] = useState('');

  // Fetch all available food listings
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['availableFoodListings'],
    queryFn: async () => {
      // Since getByStatus is not available, we'll use getAll and filter client-side
      const allListings = await db.foodListings.getAll();
      return allListings.filter(listing => listing.status === 'available');
    },
  });

  // Get current user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Handle search by address
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;
    
    try {
      const location = await geocodeAddress(searchAddress);
      if (location) {
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  // Filter listings based on search query
  const filteredListings = listings?.filter(listing => 
    listing.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle listing selection
  const handleListingSelect = (listing: FoodListing) => {
    setSelectedListing(listing);
    setTimeout(() => {
      const element = document.getElementById(`listing-${listing.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <Layout>
      <div className="content-container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Available Food</h1>
          <p className="text-muted-foreground">
            Browse all available food listings in Koparkhairne, Navi Mumbai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search food listings..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>

            {/* Map View */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold">Food Map</h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Search by address..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="flex-1 h-9"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddressSearch}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Find</span>
                    </Button>
                  </div>
                </div>
                
                <MapView 
                  listings={filteredListings}
                  currentLocation={userLocation}
                  destination={selectedListing?.location}
                  showDirections={!!selectedListing}
                  onMarkerClick={handleListingSelect}
                />
                
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

            {/* Food listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Food Listings</h2>
                <Badge className="px-2 py-1">
                  {filteredListings.length} Available
                </Badge>
              </div>

              {isLoading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                // Error state
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Error loading food listings. Please try again later.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate(0)}
                    >
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredListings.length === 0 ? (
                // Empty state
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No food listings available at this time.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      Return to Home
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Listings
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <div 
                      key={listing.id} 
                      id={`listing-${listing.id}`}
                      className={`transition-all ${selectedListing?.id === listing.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => handleListingSelect(listing)}
                    >
                      <FoodCard 
                        listing={listing}
                        onClaim={() => navigate(`/food/${listing.id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Your Location</h2>
                {userLocation ? (
                  <div className="space-y-4">
                    <MapView 
                      currentLocation={userLocation}
                      zoom={15}
                    />
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-primary mr-2" />
                      <p className="text-sm text-muted-foreground">
                        Koparkhairne, Navi Mumbai
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      We need your location to show nearby food listings
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setUserLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              });
                            }
                          );
                        }
                      }}
                    >
                      Share Location
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <span>Click on map markers to see food details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <span>Allow location access for better results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <span>Search by food name or provider name</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                    <span>Check expiry times to prioritize soon-to-expire food</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AvailableFood;
