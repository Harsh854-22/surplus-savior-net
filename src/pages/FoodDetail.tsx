import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, MapPin, Info, UtensilsCrossed, Check, X, Timer, CalendarClock, AlertTriangle, 
  Users, BadgeCheck, ChevronRight, CircleAlert
} from 'lucide-react';
import { calculateDistance, calculateETA } from '@/lib/maps';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { MapView } from '@/components/MapView';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

const FoodDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showContact, setShowContact] = useState(false);

  // Fetch food listing details
  const { 
    data: listing, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['foodListing', id],
    queryFn: async () => {
      if (!id) throw new Error('Listing ID is required');
      const data = await db.foodListings.getById(id);
      if (!data) throw new Error('Listing not found');
      return data;
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

  // Calculate distance and ETA from user to food
  const distance = userLocation && listing 
    ? calculateDistance(userLocation, listing.location)
    : null;
    
  const eta = userLocation && listing 
    ? calculateETA(userLocation, listing.location)
    : null;
    
  // Check if food is about to expire
  const isAboutToExpire = listing 
    ? (listing.expiryTime - Date.now()) < 2 * 60 * 60 * 1000 // less than 2 hours
    : false;
    
  // Format preparation time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Format expiry time
  const formatExpiryTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    // If expired
    if (diff <= 0) {
      return 'Expired';
    }
    
    // If less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    }
    
    // If less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
    
    // Otherwise show date and time
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Handle claim button
  const handleClaim = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to claim this food",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (user.role !== 'ngo' && user.role !== 'volunteer') {
      toast({
        title: "Permission denied",
        description: "Only NGOs and volunteers can claim food listings",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update food listing status
      if (listing) {
        await db.foodListings.update(listing.id, {
          status: 'assigned',
          assignedTo: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        });
        
        // Create a food collection record
        await db.collections.create({
          foodListingId: listing.id,
          hotelId: listing.hotelId,
          ngoId: user.role === 'ngo' ? user.id : '',
          volunteerId: user.role === 'volunteer' ? user.id : undefined,
          pickupTime: Date.now() + (60 * 60 * 1000), // Default to 1 hour from now
          status: 'scheduled',
        });
        
        // Create notifications
        await db.notifications.create({
          userId: listing.hotelId,
          title: "Food Listing Claimed",
          message: `Your food listing "${listing.foodName}" has been claimed by ${user.name}`,
          type: "success",
        });
        
        toast({
          title: "Food claimed successfully",
          description: "You can now coordinate pickup with the provider",
        });
        
        // Refresh page data
        navigate(0);
      }
    } catch (error) {
      console.error("Error claiming food:", error);
      toast({
        title: "Failed to claim food",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  // Handle contact button click
  const handleContactClick = () => {
    setShowContact(true);
  };
  
  // Render error state
  if (error) {
    return (
      <Layout>
        <div className="content-container py-8">
          <Alert variant="destructive" className="mb-6">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Error loading food listing</AlertTitle>
            <AlertDescription>
              The food listing could not be found or has been removed.
              Please check the URL or return to the home page.
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Render loading state
  if (isLoading || !listing) {
    return (
      <Layout>
        <div className="content-container py-8">
          <Skeleton className="w-full h-8 mb-2" />
          <Skeleton className="w-3/4 h-4 mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-64 mb-6" />
              <Skeleton className="w-full h-32" />
            </div>
            
            <div>
              <Skeleton className="w-full h-64 mb-6" />
              <Skeleton className="w-full h-32" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="content-container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to listings
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{listing.foodName}</h1>
              <p className="text-muted-foreground">Listed by {listing.hotelName}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {listing.status === 'available' ? (
                <Badge className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600">Available</Badge>
              ) : listing.status === 'assigned' ? (
                <Badge variant="outline" className="px-3 py-1 text-xs">Assigned</Badge>
              ) : (
                <Badge variant="outline" className="px-3 py-1 text-xs">{listing.status}</Badge>
              )}
              
              {isAboutToExpire && (
                <Badge variant="default" className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expiring Soon
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Food Details</CardTitle>
                <CardDescription>
                  Information about the available food
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{listing.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <UtensilsCrossed className="h-4 w-4 mr-2 text-muted-foreground" />
                      Quantity
                    </h3>
                    <p className="text-xl font-medium">
                      {listing.quantity} {listing.quantityUnit}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Preparation Time
                    </h3>
                    <p>{formatTime(listing.preparationTime)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Expiry Time
                    </h3>
                    <p className={isAboutToExpire ? "text-orange-500 font-medium" : ""}>
                      {formatExpiryTime(listing.expiryTime)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <BadgeCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      FSSAI Number
                    </h3>
                    <p>{listing.fssaiNumber}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Dietary Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.dietaryInfo.isVegetarian && (
                      <Badge variant="outline" className="bg-green-50">Vegetarian</Badge>
                    )}
                    {listing.dietaryInfo.isVegan && (
                      <Badge variant="outline" className="bg-green-50">Vegan</Badge>
                    )}
                    {listing.dietaryInfo.containsNuts && (
                      <Badge variant="outline" className="bg-yellow-50">Contains Nuts</Badge>
                    )}
                    {listing.dietaryInfo.containsGluten && (
                      <Badge variant="outline" className="bg-yellow-50">Contains Gluten</Badge>
                    )}
                    {listing.dietaryInfo.containsDairy && (
                      <Badge variant="outline" className="bg-yellow-50">Contains Dairy</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Where to pick up the food
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    Address
                  </Label>
                  <p className="text-muted-foreground">{listing.location.address}</p>
                </div>
                
                <div className="aspect-video rounded-md overflow-hidden border mb-4">
                  <MapView 
                    listings={[listing]}
                    currentLocation={userLocation || undefined}
                    showDirections={userLocation !== null}
                    zoom={14}
                  />
                </div>
                
                {userLocation && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1 block">Distance</Label>
                      <p className="text-lg font-medium">
                        {distance ? `${distance.toFixed(1)} km` : 'Calculating...'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1 block">Estimated Travel Time</Label>
                      <p className="text-lg font-medium">
                        {eta ? `${eta} mins` : 'Calculating...'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Claim this food for your organization
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {listing.status === 'available' ? (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Food Available</AlertTitle>
                      <AlertDescription>
                        This food is available for pickup and will expire in {formatExpiryTime(listing.expiryTime)}.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-col gap-3">
                      <Button 
                        className="w-full" 
                        onClick={handleClaim}
                        disabled={!user || (user.role !== 'ngo' && user.role !== 'volunteer')}
                      >
                        Claim This Food
                      </Button>
                      
                      {(!user || (user.role !== 'ngo' && user.role !== 'volunteer')) && (
                        <p className="text-xs text-muted-foreground text-center">
                          Only NGOs and volunteers can claim food
                        </p>
                      )}
                    </div>
                  </>
                ) : listing.status === 'assigned' ? (
                  <>
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertTitle>Food Assigned</AlertTitle>
                      <AlertDescription>
                        This food has been assigned to {listing.assignedTo?.name}.
                      </AlertDescription>
                    </Alert>
                    
                    {listing.assignedTo?.id === user?.id && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleContactClick}
                      >
                        Contact Provider
                      </Button>
                    )}
                  </>
                ) : (
                  <Alert>
                    <X className="h-4 w-4" />
                    <AlertTitle>Food Unavailable</AlertTitle>
                    <AlertDescription>
                      This food is no longer available.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{listing.hotelName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{listing.hotelName}</p>
                    <p className="text-sm text-muted-foreground">Food Provider</p>
                  </div>
                </div>
                
                {(showContact || user?.role === 'admin') && (
                  <div className="p-4 rounded-md bg-muted space-y-2">
                    <div>
                      <p className="text-sm font-medium">Contact Information</p>
                      <p className="text-sm text-muted-foreground">+91 9876543210</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contact@example.com</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FoodDetail;
