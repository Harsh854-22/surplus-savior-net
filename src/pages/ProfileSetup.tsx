
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { geocodeAddress } from '@/lib/maps';
import { UserRole } from '@/types';

const ProfileSetup = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    // Additional fields based on role
    fssaiNumber: '',
    contactPerson: '',
    businessType: 'hotel',
    registrationNumber: '',
    beneficiaryCount: '0',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get geolocation from address
      const location = await geocodeAddress(formData.address);
      
      if (!location) {
        throw new Error('Could not geocode address');
      }
      
      // Prepare profile updates based on role
      const baseUpdates = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        location,
        profileComplete: true,
      };
      
      // Add role-specific fields
      let roleSpecificUpdates = {};
      switch (user.role) {
        case 'hotel':
          roleSpecificUpdates = {
            fssaiNumber: formData.fssaiNumber,
            contactPerson: formData.contactPerson,
            businessType: formData.businessType,
          };
          break;
        case 'ngo':
          roleSpecificUpdates = {
            registrationNumber: formData.registrationNumber,
            contactPerson: formData.contactPerson,
            beneficiaryCount: parseInt(formData.beneficiaryCount),
          };
          break;
        // Add cases for other roles if needed
      }
      
      // Update profile
      await updateUserProfile({
        ...baseUpdates,
        ...roleSpecificUpdates,
      });
      
      // Redirect to appropriate dashboard
      navigate(`/${user.role}/dashboard`);
      
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (user?.role) {
      case 'hotel':
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleSelectChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="shop">Shop / Food Store</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="fssaiNumber">FSSAI Number</Label>
              <Input
                id="fssaiNumber"
                name="fssaiNumber"
                value={formData.fssaiNumber}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your FSSAI license number for food safety compliance
              </p>
            </div>
          </>
        );
        
      case 'ngo':
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your NGO registration number for verification
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="beneficiaryCount">Number of Beneficiaries</Label>
              <Input
                id="beneficiaryCount"
                name="beneficiaryCount"
                type="number"
                min="0"
                value={formData.beneficiaryCount}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
        
      // Add cases for other roles
      default:
        return null;
    }
  };

  const getRoleTitle = (role: UserRole): string => {
    switch (role) {
      case 'hotel':
        return 'Hotel / Restaurant Profile';
      case 'ngo':
        return 'NGO / Charity Profile';
      case 'volunteer':
        return 'Volunteer Profile';
      case 'admin':
        return 'Admin Profile';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-xl animate-fade-in">
        <CardHeader>
          <CardTitle>{getRoleTitle(user.role)}</CardTitle>
          <CardDescription>
            Complete your profile to get started with the platform
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="address">Address in Koparkhairne, Navi Mumbai</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <p className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                Make sure to provide a complete address for accurate GPS matching
              </p>
            </div>
            
            {renderRoleSpecificFields()}
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : 'Complete Profile'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
