
import React from 'react';
import { FoodListing } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, UtensilsCrossed, Leaf } from 'lucide-react';

interface FoodCardProps {
  listing: FoodListing;
  onClaim?: () => void;
  showActions?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ 
  listing, 
  onClaim, 
  showActions = true 
}) => {
  const navigate = useNavigate();
  
  // Format expiry time to human-readable
  const formatExpiryTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return "Expired";
    }
    
    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const mins = Math.floor(diff / (60 * 1000));
      return `${mins} min${mins !== 1 ? 's' : ''} left`;
    }
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
    
    // More than 24 hours
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} left`;
  };
  
  const getStatusColor = (status: FoodListing['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'collected':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };
  
  const expiryTime = formatExpiryTime(listing.expiryTime);
  const isExpired = expiryTime === "Expired";
  const isExpiringSoon = !isExpired && listing.expiryTime - Date.now() < 2 * 60 * 60 * 1000; // 2 hours
  
  return (
    <Card className={`border overflow-hidden card-hover-effect ${
      isExpired ? 'opacity-60' : ''
    }`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{listing.foodName}</CardTitle>
          <Badge 
            className={`ml-2 ${getStatusColor(listing.status)}`}
            variant="outline"
          >
            {listing.status}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <User className="h-3.5 w-3.5 mr-1" />
          <span>{listing.hotelName}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {listing.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {listing.dietaryInfo.isVegetarian && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Leaf className="h-3 w-3 mr-1" />
              Vegetarian
            </Badge>
          )}
          {!listing.dietaryInfo.isVegetarian && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              <UtensilsCrossed className="h-3 w-3 mr-1" />
              Non-Veg
            </Badge>
          )}
          <Badge variant="outline">
            {listing.quantity} {listing.quantityUnit}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span className="truncate">{listing.location.address}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span className={`${
              isExpiringSoon ? 'text-amber-500 font-medium' : 
              isExpired ? 'text-destructive' : ''
            }`}>
              {expiryTime}
            </span>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-4 pt-0">
          {listing.status === 'available' && !isExpired && (
            <Button 
              className="w-full" 
              onClick={onClaim}
              disabled={isExpired}
            >
              Claim Now
            </Button>
          )}
          
          {(listing.status !== 'available' || isExpired) && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(`/food/${listing.id}`)}
            >
              View Details
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
