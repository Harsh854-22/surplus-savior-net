
import React, { useState, useEffect } from 'react';
import { VolunteerTraining } from '@/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Check, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TrainingStatus: React.FC = () => {
  const [trainings, setTrainings] = useState<VolunteerTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainings = async () => {
      if (!user) return;
      
      try {
        const volunteerTrainings = await db.volunteerTraining.getByVolunteerId(user.id);
        setTrainings(volunteerTrainings);
      } catch (error) {
        console.error('Error fetching training data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainings();
  }, [user]);

  const completeTraining = async (trainingId: string) => {
    if (!user) return;
    
    try {
      await db.volunteerTraining.update(trainingId, {
        completed: true,
        completedDate: Date.now(),
        status: 'completed',
        expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000 // valid for 6 months
      });
      
      toast({
        title: "Training Completed",
        description: "Your training has been marked as completed!",
      });
      
      // Update the local state
      setTrainings(prev => 
        prev.map(training => 
          training.id === trainingId 
            ? {
                ...training,
                completed: true,
                completedDate: Date.now(),
                status: 'completed',
                expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000
              }
            : training
        )
      );
    } catch (error) {
      console.error('Error updating training:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update training status",
      });
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const completedTrainings = trainings.filter(t => t.status === 'completed').length;
  const totalTrainings = trainings.length;
  const progressPercentage = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;

  if (trainings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Training Status
          </CardTitle>
          <CardDescription>No trainings assigned yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            You don't have any assigned trainings.
            The NGO coordinator will assign trainings to you soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Training Status
        </CardTitle>
        <CardDescription>
          Complete all required trainings to qualify for food deliveries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span>{completedTrainings} of {totalTrainings} complete</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        <div className="space-y-3 mt-4">
          {trainings.map(training => (
            <div key={training.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{training.trainingName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {training.completedDate ? (
                      <span className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
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
                {training.status === 'completed' ? (
                  <Badge className="bg-green-500">Completed</Badge>
                ) : training.status === 'in-progress' ? (
                  <Badge className="bg-yellow-500">In Progress</Badge>
                ) : (
                  <Badge>Not Started</Badge>
                )}
              </div>
              {!training.completed && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={() => completeTraining(training.id)}
                    className="w-full"
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t p-3">
        <div className="text-xs text-muted-foreground">
          <p>Training helps ensure safe and efficient food delivery</p>
        </div>
      </CardFooter>
    </Card>
  );
};
