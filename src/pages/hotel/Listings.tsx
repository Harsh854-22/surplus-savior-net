
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { Clock, MapPin, AlertTriangle, CheckCircle2, PlusCircle } from 'lucide-react';

const HotelListings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        if (!user?.id) return;
        
        // In a real app, we would filter by userId
        const allListings = await db.foodListings.getAll();
        const userListings = allListings.filter(listing => listing.donorId === user.id);
        setListings(userListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your food listings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'claimed':
        return <Badge className="bg-blue-500">Claimed</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">Completed</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Food Listings</h1>
        <Button onClick={() => navigate('/hotel/create-listing')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Listing
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No Food Listings Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't created any food listings yet. Start sharing your surplus food with those in need.
          </p>
          <Button onClick={() => navigate('/hotel/create-listing')}>
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Card key={listing.id} className="overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ backgroundImage: `url(${listing.imageUrl || '/placeholder.svg'})` }}
              ></div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{listing.name}</CardTitle>
                  {getStatusBadge(listing.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{listing.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{listing.locationName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Expires: {formatDate(listing.expiryDate)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/food/${listing.id}`)}
                >
                  View Details
                </Button>
                
                {listing.status === 'available' && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/hotel/edit-listing/${listing.id}`)}
                  >
                    Edit
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelListings;
