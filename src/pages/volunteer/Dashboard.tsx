
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, CalendarDays, Clock3, Truck, Search } from 'lucide-react';
import { TrainingStatus } from '@/components/volunteer/TrainingStatus';
import { FoodCollection } from '@/types';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<FoodCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user) return;
      
      try {
        // In a real app, filter by volunteer ID
        const volunteerCollections = await db.collections.getByUserId(user.id);
        setCollections(volunteerCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, [user]);

  // Generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get today's collections
  const getTodayCollections = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return collections.filter(collection => {
      const collectionDate = typeof collection.pickupTime === 'string' 
        ? new Date(collection.pickupTime).setHours(0, 0, 0, 0) 
        : new Date(collection.pickupTime).setHours(0, 0, 0, 0);
      return collectionDate === today;
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || 'Volunteer'}</h1>
        <p className="text-muted-foreground">
          Welcome to your volunteer dashboard. Here's what needs your attention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Find Food</CardTitle>
            <CardDescription>Available food in your area</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-4xl font-bold text-primary">3</p>
            <p className="text-sm text-muted-foreground">Food listings available for pickup</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/volunteer/available')}>
              <Search className="mr-2 h-4 w-4" />
              Browse Available Food
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Schedule</CardTitle>
            <CardDescription>Upcoming food deliveries</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-4xl font-bold text-primary">{getTodayCollections().length}</p>
            <p className="text-sm text-muted-foreground">Deliveries scheduled for today</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/volunteer/schedule')}>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Your contribution impact</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-4xl font-bold text-primary">{collections.filter(c => c.status === 'completed').length}</p>
            <p className="text-sm text-muted-foreground">Total deliveries completed</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Your Impact
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-start justify-between p-4 border rounded-md animate-pulse">
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-40"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : getTodayCollections().length > 0 ? (
                <div className="space-y-4">
                  {getTodayCollections().map(collection => (
                    <div key={collection.id} className="flex items-start justify-between p-4 border rounded-md">
                      <div className="space-y-1">
                        <p className="font-medium">Food Collection #{collection.id.slice(0, 8)}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>Pickup from Hotel ID: {collection.hotelId.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {typeof collection.pickupTime === 'string'
                              ? new Date(collection.pickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : new Date(collection.pickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/volunteer/schedule')}>
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h4 className="text-lg font-medium mb-2">No Deliveries Today</h4>
                  <p className="text-muted-foreground mb-4">
                    You don't have any deliveries scheduled for today.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/volunteer/available')}>
                    Find Available Pickups
                  </Button>
                </div>
              )}

              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/volunteer/schedule')}>
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent deliveries and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Food delivered successfully</p>
                    <p className="text-sm text-muted-foreground">
                      You delivered food from Grand Hotel to Community Center
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Yesterday
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New delivery assigned</p>
                    <p className="text-sm text-muted-foreground">
                      You were assigned a delivery from Fresh Bakery
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    2 days ago
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full">
                    <Clock3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Schedule updated</p>
                    <p className="text-sm text-muted-foreground">
                      Your delivery schedule was updated
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    3 days ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Training component */}
          <TrainingStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/volunteer/available')}>
                Find Available Food
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/volunteer/schedule')}>
                View Schedule
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                Update Profile
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/notifications')}>
                Check Notifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span>Always confirm pickup times with the food provider</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span>Check food condition before accepting the delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span>Use insulated bags for transporting hot food</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                  <span>Drive safely and follow traffic rules</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
