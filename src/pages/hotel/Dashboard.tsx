
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { FoodListing, FoodCollection, Notification } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, PlusCircle, ArrowUpRight, ShoppingBag } from 'lucide-react';

const HotelDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeListings, setActiveListings] = useState<FoodListing[]>([]);
  const [recentCollections, setRecentCollections] = useState<FoodCollection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch active listings for this hotel
        const allListings = await db.foodListings.getAll();
        const hotelListings = allListings.filter(
          listing => listing.hotelId === user.id && 
          ['available', 'assigned'].includes(listing.status)
        );
        setActiveListings(hotelListings);
        
        // Fetch recent collections
        const collections = await db.collections.getByUserId(user.id);
        setRecentCollections(collections.slice(0, 5));
        
        // Fetch notifications
        const userNotifications = await db.notifications.getForUser(user.id);
        setNotifications(userNotifications.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <Layout>
      <div className="py-8 px-4 sm:px-0">
        <div className="content-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold animate-fade-in">
              Welcome back, {user.name || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your food listings and track collections
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-dashed animate-fade-in"
              onClick={() => navigate('/hotel/create-listing')}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Create New Listing</h3>
                <p className="text-sm text-muted-foreground">List surplus food</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 animate-fade-in"
              onClick={() => navigate('/hotel/listings')}
              style={{ animationDelay: '100ms' }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">My Listings</h3>
                <p className="text-sm text-muted-foreground">Manage all listings</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 animate-fade-in"
              onClick={() => navigate('/hotel/collections')}
              style={{ animationDelay: '200ms' }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Collection Schedule</h3>
                <p className="text-sm text-muted-foreground">View upcoming pickups</p>
              </div>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Listings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Listings</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => navigate('/hotel/listings')}
                >
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="h-[200px] animate-pulse rounded-lg bg-muted"></div>
                  ))}
                </div>
              ) : activeListings.length > 0 ? (
                <div className="space-y-4">
                  {activeListings.map(listing => (
                    <FoodCard 
                      key={listing.id} 
                      listing={listing}
                      onClaim={() => navigate(`/food/${listing.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No Active Listings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any active food listings right now
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/hotel/create-listing')}
                    >
                      Create New Listing
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Collections */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Collections</CardTitle>
                  <CardDescription>Food collected from your listings</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted"></div>
                      ))}
                    </div>
                  ) : recentCollections.length > 0 ? (
                    <div className="space-y-4">
                      {recentCollections.map(collection => (
                        <div 
                          key={collection.id}
                          className="flex items-center py-2 border-b border-border last:border-0"
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                            collection.status === 'completed' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {collection.status === 'completed' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Collection #{collection.id.substring(collection.id.length - 5)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(collection.pickupTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No collections yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Your recent updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted"></div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-3 rounded-md text-sm ${
                            !notification.read 
                              ? 'bg-primary/5 border border-primary/10' 
                              : 'bg-muted/50'
                          }`}
                        >
                          <div className="font-medium mb-1">{notification.title}</div>
                          <p className="text-muted-foreground text-xs">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HotelDashboard;
