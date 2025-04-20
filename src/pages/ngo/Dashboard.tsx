
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { Calendar, MapPin, Clock, ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';

const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claimedListings, setClaimedListings] = useState<FoodListing[]>([]);
  const [statistics, setStatistics] = useState({
    totalClaimed: 0,
    totalCompleted: 0,
    peopleHelped: 0,
    foodSaved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, we would filter by NGO ID
        const listings = await db.foodListings.getAll();
        const claimed = listings.filter(listing => 
          listing.status === 'claimed' && listing.claimedBy === user?.id
        );
        setClaimedListings(claimed);
        
        // Calculate statistics
        const completed = listings.filter(listing => 
          listing.status === 'completed' && listing.claimedBy === user?.id
        );
        
        setStatistics({
          totalClaimed: claimed.length,
          totalCompleted: completed.length,
          // These would come from real data in a complete app
          peopleHelped: completed.length * 20, // Estimate 20 people per food donation
          foodSaved: completed.reduce((total, listing) => total + (listing.quantity || 0), 0)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {user?.name || 'User'}. Manage your food collections and track your impact.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Food Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.totalCompleted > 0 ? '+1 from last month' : 'Start collecting food'}
            </p>
          </CardContent>
          <div className="h-1 bg-primary/10">
            <div className="h-1 bg-primary w-1/2"></div>
          </div>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalClaimed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active food collections
            </p>
          </CardContent>
          <div className="h-1 bg-primary/10">
            <div className="h-1 bg-primary w-1/4"></div>
          </div>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              People Helped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.peopleHelped}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated impact
            </p>
          </CardContent>
          <div className="h-1 bg-primary/10">
            <div className="h-1 bg-primary w-3/4"></div>
          </div>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Food Saved (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.foodSaved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total food waste prevented
            </p>
          </CardContent>
          <div className="h-1 bg-primary/10">
            <div className="h-1 bg-primary w-2/3"></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Collections</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
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
          ) : claimedListings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Collections</h3>
              <p className="text-muted-foreground mb-6">
                You haven't claimed any food listings yet.
              </p>
              <Button onClick={() => navigate('/food/available')}>
                Find Available Food
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {claimedListings.map(listing => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{listing.name}</CardTitle>
                        <CardDescription>From {listing.donorName}</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/food/${listing.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{listing.locationName}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Pickup by {new Date(listing.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{listing.quantity} kg available</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Can feed ~{listing.quantity * 4} people</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Collections</h3>
            <p className="text-muted-foreground">
              Any scheduled future pickups will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Collection History</h3>
            <p className="text-muted-foreground mb-6">
              Your past food collections will be shown here.
            </p>
            <Button variant="outline" onClick={() => navigate('/ngo/collections')}>
              View All Collections
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Nearby Available Food</h2>
        <Button variant="outline" onClick={() => navigate('/food/available')}>
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Explore Available Food</h3>
              <p className="text-muted-foreground mb-6">
                Find and claim food donations near you to help those in need.
              </p>
              <Button onClick={() => navigate('/food/available')}>
                See Available Food
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NGODashboard;
