
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { FoodListing, FoodCollection } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  MapPin, 
  User, 
  UtensilsCrossed, 
  Leaf, 
  AlertTriangle,
  Check,
  X,
  Phone,
  Share2,
} from 'lucide-react';
import { MapView } from '@/components/MapView';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const FoodDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimNote, setClaimNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        const fetchedListing = await db.foodListings.getById(id);
        
        if (!fetchedListing) {
          // Listing not found
          toast({
            title: 'Not found',
            description: 'The food listing you are looking for does not exist.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        setListing(fetchedListing);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load food listing details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListing();
  }, [id, navigate, toast]);
  
  const formatExpiryTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    
    const expiry = new Date(timestamp);
    const now = new Date();
    
    if (expiry < now) {
      return 'Expired';
    }
    
    // Format as date and time if today, or just date if not today
    const isToday = expiry.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${expiry.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
      })}`;
    }
    
    return expiry.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    
    const expiry = new Date(timestamp);
    const now = new Date();
    
    if (expiry < now) {
      return 'Expired';
    }
    
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
    
    return `${diffMinutes}m remaining`;
  };
  
  const handleClaimSubmit = async () => {
    if (!listing || !user || user.role !== 'ngo') return;
    
    setIsSubmitting(true);
    
    try {
      // Create a new collection record
      const newCollection: Omit<FoodCollection, 'id' | 'createdAt'> = {
        foodListingId: listing.id,
        hotelId: listing.hotelId,
        ngoId: user.id,
        pickupTime: Date.now() + 60 * 60 * 1000, // 1 hour from now
        status: 'scheduled',
        notes: claimNote,
      };
      
      const collection = await db.collections.create(newCollection);
      
      // Update the listing status
      await db.foodListings.update(listing.id, {
        status: 'assigned',
        assignedTo: {
          id: user.id,
          name: user.name || 'Anonymous NGO',
          role: 'ngo',
        },
      });
      
      // Update local state
      setListing({
        ...listing,
        status: 'assigned',
        assignedTo: {
          id: user.id,
          name: user.name || 'Anonymous NGO',
          role: 'ngo',
        },
      });
      
      // Create notifications for both parties
      await db.notifications.create({
        userId: listing.hotelId,
        title: 'Food Listing Claimed',
        message: `Your food listing "${listing.foodName}" has been claimed by ${user.name || 'an NGO'}.`,
        type: 'success',
      });
      
      await db.notifications.create({
        userId: user.id,
        title: 'Food Claimed Successfully',
        message: `You have successfully claimed "${listing.foodName}" from ${listing.hotelName}.`,
        type: 'success',
      });
      
      toast({
        title: 'Food claimed successfully',
        description: 'You have been assigned this food for collection.',
      });
      
      setClaimDialogOpen(false);
    } catch (error) {
      console.error('Error claiming food:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim this food. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canClaim = () => {
    if (!user || !listing) return false;
    
    // Only NGOs can claim food
    if (user.role !== 'ngo') return false;
    
    // Can only claim if status is available
    if (listing.status !== 'available') return false;
    
    // Can't claim if expired
    if (listing.expiryTime < Date.now()) return false;
    
    return true;
  };
  
  const isExpired = listing && listing.expiryTime < Date.now();
  const isExpiringSoon = listing && !isExpired && listing.expiryTime - Date.now() < 2 * 60 * 60 * 1000; // 2 hours
  
  return (
    <Layout>
      <div className="py-8 px-4 sm:px-0">
        <div className="content-container max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-3/4 bg-muted rounded-lg"></div>
              <div className="h-4 w-1/2 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg mt-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          ) : listing ? (
            <div className="animate-fade-in">
              {/* Navigation and status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)}
                  className="w-fit"
                >
                  ← Back
                </Button>
                
                <Badge 
                  className={`${
                    listing.status === 'available' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    listing.status === 'assigned' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    listing.status === 'collected' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                    listing.status === 'delivered' ? 'bg-primary/10 text-primary border-primary/20' :
                    listing.status === 'expired' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  } text-xs px-3 py-1`}
                  variant="outline"
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>
              
              {/* Warning for expired listing */}
              {isExpired && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Expired Listing</AlertTitle>
                  <AlertDescription>
                    This food listing has expired and is no longer available for collection.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Warning for expiring soon */}
              {isExpiringSoon && !isExpired && (
                <Alert variant="warning" className="mb-6 border-amber-500/50 text-amber-600 bg-amber-500/10">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Expiring Soon</AlertTitle>
                  <AlertDescription>
                    This food listing will expire soon. Please claim and collect it as soon as possible.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Food title and description */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{listing.foodName}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span>{listing.hotelName}</span>
                </div>
                <p className="text-foreground/90">{listing.description}</p>
              </div>
              
              {/* Food info cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Expiry Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`font-medium ${
                      isExpired ? 'text-destructive' : 
                      isExpiringSoon ? 'text-amber-500' : ''
                    }`}>
                      {formatExpiryTime(listing.expiryTime)}
                    </div>
                    {!isExpired && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatRelativeTime(listing.expiryTime)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-medium">
                      Koparkhairne, Navi Mumbai
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {listing.location.address}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <UtensilsCrossed className="h-4 w-4 mr-2" />
                      Quantity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-medium">
                      {listing.quantity} {listing.quantityUnit}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      FSSAI: {listing.fssaiNumber}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Map */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <MapView 
                  listings={[listing]}
                  currentLocation={listing.location}
                  zoom={15}
                />
              </div>
              
              {/* Dietary Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Dietary Information</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.dietaryInfo.isVegetarian ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      <UtensilsCrossed className="h-3 w-3 mr-1" />
                      Non-Vegetarian
                    </Badge>
                  )}
                  
                  {listing.dietaryInfo.isVegan && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Vegan
                    </Badge>
                  )}
                  
                  {listing.dietaryInfo.containsNuts && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      Contains Nuts
                    </Badge>
                  )}
                  
                  {listing.dietaryInfo.containsGluten && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      Contains Gluten
                    </Badge>
                  )}
                  
                  {listing.dietaryInfo.containsDairy && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      Contains Dairy
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Contact Information (if assigned) */}
              {listing.status === 'assigned' && listing.assignedTo && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned To</CardTitle>
                    <CardDescription>This food has been claimed and is awaiting collection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{listing.assignedTo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.assignedTo.role === 'ngo' ? 'NGO/Charity' : 'Volunteer'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canClaim() && (
                  <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="sm:flex-1 md:flex-none md:min-w-[180px]">
                        Claim Food
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Claim Food Listing</DialogTitle>
                        <DialogDescription>
                          You are about to claim this food for your organization. 
                          Please confirm your intention to collect it.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-md">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{listing.foodName}</p>
                            <p className="text-sm text-muted-foreground">
                              {listing.quantity} {listing.quantityUnit} • {formatRelativeTime(listing.expiryTime)}
                            </p>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <Label htmlFor="claimNote">Add a note (optional)</Label>
                          <Textarea
                            id="claimNote"
                            placeholder="Add any special instructions or notes for the donor"
                            value={claimNote}
                            onChange={(e) => setClaimNote(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setClaimDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleClaimSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                              <div className="loading-dot"></div>
                            </div>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Confirm Claim
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button 
                  variant="outline"
                  className="sm:flex-1 md:flex-none md:min-w-[180px]"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold">Food listing not found</h2>
              <p className="text-muted-foreground mt-2">
                The food listing you are looking for may have been removed or does not exist.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="mt-6"
              >
                Go to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FoodDetail;
