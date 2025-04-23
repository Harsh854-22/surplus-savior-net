
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VolunteerTraining, VolunteerPerformance, User } from '@/types';
import { db } from '@/lib/firebase';
import { 
  Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Award, Calendar, CheckCircle, Clock, AlertTriangle, Users, UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VolunteerManagement: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<VolunteerTraining[]>([]);
  const [performances, setPerformances] = useState<VolunteerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, fetch only volunteers connected to the NGO
        const allUsers = await db.users.getAll();
        const volunteerUsers = allUsers.filter(user => user.role === 'volunteer');
        setVolunteers(volunteerUsers);
        
        // Get all trainings
        const allTrainings = await db.volunteerTraining.getAll();
        setTrainings(allTrainings);
        
        // Get volunteer performances
        const performanceData: VolunteerPerformance[] = [];
        for (const volunteer of volunteerUsers) {
          const performance = await db.volunteerPerformance.getById(volunteer.id);
          if (performance) {
            performanceData.push(performance);
          }
        }
        setPerformances(performanceData);
      } catch (error) {
        console.error('Error fetching volunteer data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load volunteer data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getVolunteerPerformance = (volunteerId: string) => {
    return performances.find(p => p.volunteerId === volunteerId);
  };

  const getVolunteerTrainings = (volunteerId: string) => {
    return trainings.filter(t => t.volunteerId === volunteerId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTrainingStatus = (training: VolunteerTraining) => {
    if (training.status === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (training.status === 'in-progress') {
      return <Badge className="bg-yellow-500">In Progress</Badge>;
    } else if (training.status === 'not-started') {
      return <Badge className="bg-slate-500">Not Started</Badge>;
    } else {
      return <Badge className="bg-red-500">Expired</Badge>;
    }
  };

  const getPerformanceBadge = (value: number, type: 'rating' | 'onTime') => {
    if (type === 'rating') {
      if (value > 4.5) return <Badge className="bg-green-500">{value}</Badge>;
      if (value > 3.5) return <Badge className="bg-yellow-500">{value}</Badge>;
      return <Badge className="bg-red-500">{value}</Badge>;
    } else {
      if (value > 90) return <Badge className="bg-green-500">{value}%</Badge>;
      if (value > 75) return <Badge className="bg-yellow-500">{value}%</Badge>;
      return <Badge className="bg-red-500">{value}%</Badge>;
    }
  };

  const assignTraining = async (volunteerId: string, trainingName: string) => {
    try {
      await db.volunteerTraining.create({
        volunteerId,
        trainingName,
        completed: false,
        status: 'not-started'
      });
      
      toast({
        title: "Training Assigned",
        description: `${trainingName} has been assigned to the volunteer`,
      });
      
      // Refresh trainings
      const allTrainings = await db.volunteerTraining.getAll();
      setTrainings(allTrainings);
    } catch (error) {
      console.error('Error assigning training:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign training",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Volunteer Management</h2>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/users')}
        >
          <UserPlus size={16} />
          <span>Add Volunteer</span>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {volunteers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Volunteers Found</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no volunteers registered for your organization.
                </p>
                <Button onClick={() => navigate('/admin/users')}>
                  Add Volunteers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteers.map(volunteer => {
                const performance = getVolunteerPerformance(volunteer.id);
                
                return (
                  <Card key={volunteer.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>
                              {getInitials(volunteer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{volunteer.name}</CardTitle>
                            <CardDescription>{volunteer.phone}</CardDescription>
                          </div>
                        </div>
                        {performance?.collectionsCompleted && performance.collectionsCompleted > 10 && (
                          <Badge className="bg-primary">Top Performer</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mt-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Deliveries</span>
                            <span className="font-medium">{performance?.collectionsCompleted || 0}</span>
                          </div>
                          <Progress value={Math.min((performance?.collectionsCompleted || 0) * 5, 100)} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">On-time Rate</span>
                            <span className="font-medium">
                              {getPerformanceBadge(performance?.onTimeDeliveryRate || 0, 'onTime')}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            <span className="font-medium">
                              {getPerformanceBadge(performance?.averageRating || 0, 'rating')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Training Status</span>
                            {getVolunteerTrainings(volunteer.id).some(t => t.status === 'completed') ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" /> Trained
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Needs Training
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-6 mt-4">
          {volunteers.map(volunteer => {
            const volunteerTrainings = getVolunteerTrainings(volunteer.id);
            
            return (
              <Card key={volunteer.id} className="mb-6">
                <CardHeader>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {getInitials(volunteer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{volunteer.name}</CardTitle>
                      <CardDescription>{volunteer.phone}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-3">Training Status</h4>
                  
                  {volunteerTrainings.length === 0 ? (
                    <div className="text-center py-4 bg-muted rounded-md">
                      <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No trainings assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {volunteerTrainings.map(training => (
                        <div 
                          key={training.id} 
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div>
                            <p className="font-medium">{training.trainingName}</p>
                            <p className="text-sm text-muted-foreground">
                              {training.completedDate ? (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Completed on {new Date(training.completedDate).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Assigned on {new Date(training.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {getTrainingStatus(training)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col w-full space-y-2">
                    <h4 className="font-medium text-sm">Assign New Training</h4>
                    <div className="flex flex-wrap gap-2">
                      {!volunteerTrainings.some(t => t.trainingName === 'Food Safety Basics') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => assignTraining(volunteer.id, 'Food Safety Basics')}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Food Safety
                        </Button>
                      )}
                      
                      {!volunteerTrainings.some(t => t.trainingName === 'Safe Driving Course') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => assignTraining(volunteer.id, 'Safe Driving Course')}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Safe Driving
                        </Button>
                      )}
                      
                      {!volunteerTrainings.some(t => t.trainingName === 'Food Storage Guidelines') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => assignTraining(volunteer.id, 'Food Storage Guidelines')}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Food Storage
                        </Button>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};
