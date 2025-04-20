
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, MapPin, Clock, CalendarDays, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

const VolunteerSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
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
      },
      {
        id: '3',
        foodListingId: 'food3',
        foodName: 'Catered Event Leftovers',
        pickupLocation: {
          name: 'Event Center, Sector 10',
          lat: 19.1080,
          lng: 73.0160
        },
        dropoffLocation: {
          name: 'Shelter Home, Sector 7',
          lat: 19.1030,
          lng: 73.0190
        },
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 345600000).toISOString(), // 4 days later
        distance: 3.2
      }
    ];
    
    setDeliveries(mockDeliveries);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterDeliveriesByDate = (date: Date | undefined) => {
    if (!date) return deliveries;
    
    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.scheduledDate);
      return (
        deliveryDate.getDate() === date.getDate() &&
        deliveryDate.getMonth() === date.getMonth() &&
        deliveryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const filteredDeliveries = filterDeliveriesByDate(date);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Delivery Schedule</h1>
          <p className="text-muted-foreground">
            Manage your upcoming food delivery schedule.
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mt-2 md:mt-0">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
            <CardDescription>View by date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant={!date ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setDate(undefined)}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                All Deliveries
              </Button>
              <Button 
                variant={date?.toDateString() === new Date().toDateString() ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setDate(new Date())}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Today
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDate(tomorrow);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <div className="mb-4">
            <h2 className="text-lg font-medium flex items-center">
              {date ? (
                `Deliveries for ${format(date, "MMMM d, yyyy")}`
              ) : (
                "All Upcoming Deliveries"
              )}
              <span className="ml-2 bg-muted text-muted-foreground text-sm py-0.5 px-2 rounded-full">
                {filteredDeliveries.length} 
                {filteredDeliveries.length === 1 ? ' delivery' : ' deliveries'}
              </span>
            </h2>
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
          ) : filteredDeliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Deliveries Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {date ? `No deliveries scheduled for ${format(date, "MMMM d, yyyy")}.` : 
                    "You don't have any upcoming deliveries scheduled."}
                  </p>
                  <Button onClick={() => navigate('/volunteer/available')}>
                    Find Available Deliveries
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map(delivery => (
                <Card key={delivery.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{delivery.foodName}</CardTitle>
                        <CardDescription>
                          {formatDate(delivery.scheduledDate)}
                        </CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/volunteer/delivery/${delivery.id}`)}
                      >
                        Start Delivery
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium mr-2">Pickup:</span>
                            <span>{delivery.pickupLocation.name}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium mr-2">Dropoff:</span>
                            <span>{delivery.dropoffLocation.name}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium mr-2">Time:</span>
                            <span>{formatTime(delivery.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium mr-2">Distance:</span>
                            <span>{delivery.distance} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerSchedule;
