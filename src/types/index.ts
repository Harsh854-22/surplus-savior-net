
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
  foodName: string; // Added back for backward compatibility
  description: string;
  quantity: number;
  servingSize: number;
  quantityUnit: string; // Added back for backward compatibility
  expiry: string;
  expiryTime: number; // Added back for backward compatibility
  preparationTime?: number; // Added back for backward compatibility
  fssaiNumber?: string; // Added back for backward compatibility
  dietaryInfo?: { // Added back for backward compatibility
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
    address?: string; // Added back for backward compatibility
  };
  address: string;
  imageUrl?: string;
  assignedTo?: { // Added back for backward compatibility
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
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'canceled' | 'scheduled'; // Added 'scheduled'
  pickupTime: string | number; // Allow both string and number
  completedTime?: string;
  deliveryTime?: number; // Added back for backward compatibility
  notes?: string;
  createdAt?: number; // Added back as optional
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
