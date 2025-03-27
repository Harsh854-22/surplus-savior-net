
export type UserRole = 'hotel' | 'ngo' | 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  profileComplete: boolean;
  createdAt: number;
}

export interface HotelProfile extends User {
  role: 'hotel';
  fssaiNumber: string;
  contactPerson: string;
  businessType: 'hotel' | 'restaurant' | 'shop' | 'other';
}

export interface NGOProfile extends User {
  role: 'ngo';
  registrationNumber: string;
  contactPerson: string;
  beneficiaryCount: number;
}

export interface VolunteerProfile extends User {
  role: 'volunteer';
  availability: {
    [day: string]: {
      available: boolean;
      timeSlots?: string[];
    };
  };
  trainingCompleted: boolean;
  activeArea: string;
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions: string[];
}

export interface FoodListing {
  id: string;
  hotelId: string;
  hotelName: string;
  foodName: string;
  description: string;
  quantity: number;
  quantityUnit: string;
  preparationTime: number;
  expiryTime: number;
  fssaiNumber: string;
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    containsNuts: boolean;
    containsGluten: boolean;
    containsDairy: boolean;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: 'available' | 'assigned' | 'collected' | 'delivered' | 'expired' | 'cancelled';
  assignedTo?: {
    id: string;
    name: string;
    role: 'ngo' | 'volunteer';
  };
  createdAt: number;
}

export interface FoodCollection {
  id: string;
  foodListingId: string;
  hotelId: string;
  ngoId: string;
  volunteerId?: string;
  pickupTime: number;
  deliveryTime?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
}
