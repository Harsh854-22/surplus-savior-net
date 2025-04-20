
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  TrendingUp,
  Car
} from 'lucide-react';

interface Delivery {
  id: string;
  foodListingId: string;
  foodName: string;
  pickupLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  dropoffLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed';
  scheduledDate: string;
  distance?: number;
}

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalDistance: 0,
    deliveriesThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - in a real app this would come from the database
    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        foodListingId: 'food1',
        foodName: 'Restaurant Surplus Meals',
        pickupLocation: {
          name: 'Grand Hotel, Koparkhairne',
          lat: 19.1025,
          lng: 73.0148
        },
        dropoffLocation: {
          name: 'Community Center, Sector 5',
          lat: 19.1050,
          lng: 73.0170
        },
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        distance: 2.3
      },
      {
        id: '2',
        foodListingId: 'food2',
        foodName: 'Bakery Items',
        pickupLocation: {
          name: 'Fresh Bakery, Sector 8',
          lat: 19.1060,
          lng: 73.0130
        },
        dropoffLocation: {
          name: 'New Hope NGO, Sector 3',
          lat: 19.1010,
          lng: 73.0140
        },
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        distance: 1.8
      }
    ];
    
    setDeliveries(mockDeliveries);
    
    setStats({
      totalDeliveries: 14,
      totalDistance: 35.6,
      deliveriesThisWeek: 2
    });
    
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {user?.name || 'Volunteer'}. Manage your delivery schedule and track your impact.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Helping communities in need
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distance Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance} km</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total distance traveled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveriesThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deliveries scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upcoming Deliveries</h2>
          <Button variant="outline" onClick={() => navigate('/volunteer/schedule')}>View Full Schedule</Button>
        </div>
        
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
        ) : deliveries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Deliveries</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any scheduled deliveries at the moment.
                </p>
                <Button onClick={() => navigate('/volunteer/available')}>
                  Find Available Deliveries
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map(delivery => (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{delivery.foodName}</CardTitle>
                      <CardDescription>
                        Scheduled for {formatDate(delivery.scheduledDate)}
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/volunteer/delivery/${delivery.id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Pickup:</span>
                        <span className="ml-2">{delivery.pickupLocation.name}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Dropoff:</span>
                        <span className="ml-2">{delivery.dropoffLocation.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Time:</span>
                        <span className="ml-2">
                          {new Date(delivery.scheduledDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Distance:</span>
                        <span className="ml-2">{delivery.distance} km</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Impact Summary</CardTitle>
            <CardDescription>Your contribution to the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>People helped</span>
                </div>
                <span className="font-medium">~280</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Food waste prevented</span>
                </div>
                <span className="font-medium">70 kg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Total distance</span>
                </div>
                <span className="font-medium">{stats.totalDistance} km</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your volunteer activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/volunteer/schedule')}>
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/volunteer/available')}>
                <MapPin className="mr-2 h-4 w-4" />
                Find Available Deliveries
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/volunteer/history')}>
                <Clock className="mr-2 h-4 w-4" />
                View Delivery History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
