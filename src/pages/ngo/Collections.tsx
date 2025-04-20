
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, Package } from 'lucide-react';

const NGOCollections: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // In a real app, filter by NGO ID and completed status
        const listings = await db.foodListings.getAll();
        const completedCollections = listings.filter(
          listing => listing.status === 'collected' && listing.assignedTo?.id === user?.id
        );
        setCollections(completedCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user?.id]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Collection History</h1>
          <p className="text-muted-foreground">
            View all your past food collections and their impact.
          </p>
        </div>
        <Button onClick={() => navigate('/food/available')}>Find New Food</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No Collections Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't completed any food collections yet. Start by finding available food near you.
          </p>
          <Button onClick={() => navigate('/food/available')}>
            Find Available Food
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {collections.map(collection => (
            <Card key={collection.id}>
              <CardHeader>
                <CardTitle>{collection.foodName}</CardTitle>
                <CardDescription>From {collection.hotelName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{collection.location.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Collected on {formatDate(collection.expiryTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{collection.quantity} kg of food saved</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{collection.description}</p>
              </CardContent>
              <CardFooter>
                <div className="bg-muted/50 p-3 rounded-md w-full">
                  <div className="font-medium">Impact:</div>
                  <div className="text-muted-foreground">
                    This collection helped feed approximately {collection.quantity * 4} people and prevented
                    {' '}{collection.quantity} kg of food waste.
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NGOCollections;
