import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    quantity: '1',
    quantityUnit: 'servings',
    expiryHours: 4, // Default 4 hours
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      containsNuts: false,
      containsGluten: false,
      containsDairy: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user || user.role !== 'hotel') {
    navigate('/');
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDietaryChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietaryInfo: {
        ...prev.dietaryInfo,
        [name]: checked,
      },
    }));
  };
  
  const handleExpiryChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, expiryHours: value[0] }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the listing data
      const now = Date.now();
      const expiryTime = now + formData.expiryHours * 60 * 60 * 1000; // Convert hours to milliseconds
      
      const newListing: Omit<FoodListing, 'id' | 'createdAt'> = {
        hotelId: user.id,
        hotelName: user.name || 'Anonymous Hotel',
        title: formData.foodName, // Setting title same as foodName
        foodName: formData.foodName,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        servingSize: parseInt(formData.quantity), // Setting servingSize same as quantity
        quantityUnit: formData.quantityUnit,
        expiry: new Date(expiryTime).toISOString(), // Adding ISO string for expiry
        preparationTime: now,
        expiryTime,
        fssaiNumber: (user as any).fssaiNumber || 'FSSAI-PENDING',
        dietaryInfo: formData.dietaryInfo,
        location: {
          address: user.address,
          lat: user.location.lat,
          lng: user.location.lng,
        },
        address: user.address, // Adding address as separate field
        status: 'available',
      };
      
      // Create the listing
      const listing = await db.foodListings.create(newListing);
      
      toast({
        title: 'Food listing created',
        description: 'Your surplus food has been listed successfully.',
      });
      
      // Redirect to listing details
      navigate(`/food/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while creating your listing.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="py-8 px-4 sm:px-0">
        <div className="content-container max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold animate-fade-in">Create Food Listing</h1>
            <p className="text-muted-foreground mt-1">
              Share your surplus food with those in need
            </p>
          </div>
          
          <Card className="animate-fade-in">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Food Details</CardTitle>
                <CardDescription>
                  Provide accurate information about the food you're sharing
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodName">Food Name</Label>
                    <Input
                      id="foodName"
                      name="foodName"
                      value={formData.foodName}
                      onChange={handleChange}
                      placeholder="e.g., Vegetable Biryani"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the food, including ingredients and preparation method"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantityUnit">Unit</Label>
                      <Select
                        value={formData.quantityUnit}
                        onValueChange={(value) => handleSelectChange('quantityUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servings">Servings</SelectItem>
                          <SelectItem value="plates">Plates</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="packs">Packs</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Expiry Time */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <h3 className="text-base font-medium mb-1">Expiry Time</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Specify how long the food will be good for
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Slider
                          value={[formData.expiryHours]}
                          min={1}
                          max={24}
                          step={1}
                          onValueChange={handleExpiryChange}
                        />
                      </div>
                      <div className="w-16 text-right font-medium">
                        {formData.expiryHours} {formData.expiryHours === 1 ? 'hour' : 'hours'}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-md flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Automatic Expiry</p>
                        <p className="text-xs text-muted-foreground">
                          Listing will be automatically removed after the expiry time
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                </div>
                
                {/* Dietary Information */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <h3 className="text-base font-medium mb-1">Dietary Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Help recipients understand if the food meets their dietary needs
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="isVegetarian" className="cursor-pointer">Vegetarian</Label>
                      <Switch
                        id="isVegetarian"
                        checked={formData.dietaryInfo.isVegetarian}
                        onCheckedChange={(checked) => handleDietaryChange('isVegetarian', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="isVegan" className="cursor-pointer">Vegan</Label>
                      <Switch
                        id="isVegan"
                        checked={formData.dietaryInfo.isVegan}
                        onCheckedChange={(checked) => handleDietaryChange('isVegan', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="containsNuts" className="cursor-pointer">Contains Nuts</Label>
                      <Switch
                        id="containsNuts"
                        checked={formData.dietaryInfo.containsNuts}
                        onCheckedChange={(checked) => handleDietaryChange('containsNuts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="containsGluten" className="cursor-pointer">Contains Gluten</Label>
                      <Switch
                        id="containsGluten"
                        checked={formData.dietaryInfo.containsGluten}
                        onCheckedChange={(checked) => handleDietaryChange('containsGluten', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="containsDairy" className="cursor-pointer">Contains Dairy</Label>
                      <Switch
                        id="containsDairy"
                        checked={formData.dietaryInfo.containsDairy}
                        onCheckedChange={(checked) => handleDietaryChange('containsDairy', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/hotel/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  ) : 'Create Listing'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;
