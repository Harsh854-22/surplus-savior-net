
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
  description: string;
  quantity: number;
  servingSize: number;
  expiry: string;
  status: 'available' | 'assigned' | 'collected' | 'expired';
  createdAt: number;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl?: string;
}

export interface FoodCollection {
  id: string;
  foodListingId: string;
  hotelId: string;
  ngoId: string;
  volunteerId?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'canceled';
  pickupTime: string;
  completedTime?: string;
  notes?: string;
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
