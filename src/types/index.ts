
export type UserRole = 'hotel' | 'ngo' | 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  address: string;
  profileComplete: boolean;
  createdAt: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface FoodListing {
  id: string;
  hotelId: string;
  hotelName: string;
  title: string;
  foodName: string;
  description: string;
  quantity: number;
  servingSize: number;
  quantityUnit: string;
  expiry: string;
  expiryTime: number;
  preparationTime?: number;
  fssaiNumber?: string;
  dietaryInfo?: {
    isVegetarian: boolean;
    isVegan: boolean;
    containsNuts: boolean;
    containsGluten: boolean;
    containsDairy: boolean;
  };
  status: 'available' | 'assigned' | 'collected' | 'expired' | 'delivered' | 'cancelled';
  createdAt: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  address: string;
  imageUrl?: string;
  assignedTo?: {
    id: string;
    name: string;
    role: 'ngo' | 'volunteer';
  };
}

export interface FoodCollection {
  id: string;
  foodListingId: string;
  hotelId: string;
  ngoId: string;
  volunteerId?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'canceled' | 'scheduled';
  pickupTime: string | number;
  completedTime?: string;
  deliveryTime?: number;
  notes?: string;
  createdAt?: number;
  // Added for volunteer monitoring
  volunteerFeedback?: string;
  qualityRating?: number;
  isOnTime?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface VolunteerTraining {
  id: string;
  volunteerId: string;
  trainingName: string;
  completed: boolean;
  completedDate?: number;
  expiryDate?: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  createdAt: number;
}

export interface VolunteerPerformance {
  id: string;
  volunteerId: string;
  collectionsCompleted: number;
  onTimeDeliveryRate: number;
  averageRating: number;
  lastUpdated: number;
}
