// This is a mock Firebase implementation
// We'll need to install the actual Firebase dependencies and configure with real keys in Phase 2

import { User, FoodListing, FoodCollection, Notification, UserRole, VolunteerTraining, VolunteerPerformance } from '@/types';

// Mock authentication
export const auth = {
  currentUser: null as User | null,
  
  signIn: async (email: string, password: string): Promise<User> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fake user for demo purposes
    const mockUser: User = {
      id: 'user123',
      email,
      name: 'Demo User',
      role: 'hotel' as UserRole,
      phone: '+91 9876543210',
      address: 'Koparkhairne, Navi Mumbai',
      location: {
        lat: 19.1030,
        lng: 73.0148,
      },
      profileComplete: true,
      createdAt: Date.now(),
    };
    
    auth.currentUser = mockUser;
    return mockUser;
  },
  
  signUp: async (email: string, password: string, role: UserRole): Promise<User> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'user456',
      email,
      name: '',
      role,
      phone: '',
      address: '',
      location: {
        lat: 0,
        lng: 0,
      },
      profileComplete: false,
      createdAt: Date.now(),
    };
    
    auth.currentUser = mockUser;
    return mockUser;
  },
  
  signOut: async (): Promise<void> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    auth.currentUser = null;
  },
  
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    // In a real app, this would set up a listener
    callback(auth.currentUser);
    
    // Return mock unsubscribe function
    return () => {};
  },
};

// Mock database operations
export const db = {
  // Food listings
  foodListings: {
    getAll: async (): Promise<FoodListing[]> => {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return mockFoodListings;
    },
    
    getById: async (id: string): Promise<FoodListing | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockFoodListings.find(listing => listing.id === id) || null;
    },
    
    getNearby: async (lat: number, lng: number, radius: number): Promise<FoodListing[]> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple mock implementation that returns listings within radius km
      return mockFoodListings.filter(listing => {
        const distance = Math.sqrt(
          Math.pow(listing.location.lat - lat, 2) + 
          Math.pow(listing.location.lng - lng, 2)
        ) * 111; // rough conversion to km
        
        return distance <= radius;
      });
    },
    
    create: async (listing: Omit<FoodListing, 'id' | 'createdAt'>): Promise<FoodListing> => {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newListing: FoodListing = {
        ...listing,
        id: `listing-${Date.now()}`,
        createdAt: Date.now(),
        status: 'available',
      };
      
      mockFoodListings.push(newListing);
      return newListing;
    },
    
    update: async (id: string, updates: Partial<FoodListing>): Promise<FoodListing> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockFoodListings.findIndex(listing => listing.id === id);
      if (index === -1) throw new Error('Listing not found');
      
      mockFoodListings[index] = { ...mockFoodListings[index], ...updates };
      return mockFoodListings[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = mockFoodListings.findIndex(listing => listing.id === id);
      if (index !== -1) {
        mockFoodListings.splice(index, 1);
      }
    },
  },
  
  // Users
  users: {
    getAll: async (): Promise<User[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockUsers;
    },
    
    getById: async (id: string): Promise<User | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers.find(user => user.id === id) || null;
    },
    
    update: async (id: string, updates: Partial<User>): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockUsers.findIndex(user => user.id === id);
      if (index === -1) throw new Error('User not found');
      
      mockUsers[index] = { ...mockUsers[index], ...updates };
      return mockUsers[index];
    },
  },
  
  // Food collections
  collections: {
    create: async (collection: Omit<FoodCollection, 'id' | 'createdAt'>): Promise<FoodCollection> => {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newCollection: FoodCollection = {
        ...collection,
        id: `collection-${Date.now()}`,
        createdAt: Date.now(),
      };
      
      mockCollections.push(newCollection);
      return newCollection;
    },
    
    getByUserId: async (userId: string): Promise<FoodCollection[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return mockCollections.filter(
        collection => 
          collection.hotelId === userId || 
          collection.ngoId === userId || 
          collection.volunteerId === userId
      );
    },
    
    update: async (id: string, updates: Partial<FoodCollection>): Promise<FoodCollection> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockCollections.findIndex(collection => collection.id === id);
      if (index === -1) throw new Error('Collection not found');
      
      mockCollections[index] = { ...mockCollections[index], ...updates };
      return mockCollections[index];
    },
  },
  
  // Notifications
  notifications: {
    getForUser: async (userId: string): Promise<Notification[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockNotifications.filter(
        notification => notification.userId === userId
      ).sort((a, b) => b.createdAt - a.createdAt);
    },
    
    markAsRead: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockNotifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        mockNotifications[index].read = true;
      }
    },
    
    create: async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: Date.now(),
        read: false,
      };
      
      mockNotifications.push(newNotification);
      return newNotification;
    },
  },
  
  // Add volunteer training functionality
  volunteerTraining: {
    getAll: async (): Promise<VolunteerTraining[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockVolunteerTrainings;
    },
    
    getByVolunteerId: async (volunteerId: string): Promise<VolunteerTraining[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockVolunteerTrainings.filter(training => training.volunteerId === volunteerId);
    },
    
    update: async (id: string, updates: Partial<VolunteerTraining>): Promise<VolunteerTraining> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockVolunteerTrainings.findIndex(training => training.id === id);
      if (index === -1) throw new Error('Training not found');
      
      mockVolunteerTrainings[index] = { ...mockVolunteerTrainings[index], ...updates };
      return mockVolunteerTrainings[index];
    },
    
    create: async (training: Omit<VolunteerTraining, 'id' | 'createdAt'>): Promise<VolunteerTraining> => {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newTraining: VolunteerTraining = {
        ...training,
        id: `training-${Date.now()}`,
        createdAt: Date.now(),
      };
      
      mockVolunteerTrainings.push(newTraining);
      return newTraining;
    },
  },
  
  // Add volunteer performance tracking
  volunteerPerformance: {
    getById: async (volunteerId: string): Promise<VolunteerPerformance | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockVolunteerPerformances.find(performance => performance.volunteerId === volunteerId) || null;
    },
    
    update: async (volunteerId: string, updates: Partial<VolunteerPerformance>): Promise<VolunteerPerformance> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockVolunteerPerformances.findIndex(performance => performance.volunteerId === volunteerId);
      if (index === -1) {
        // Create new performance record if it doesn't exist
        const newPerformance: VolunteerPerformance = {
          id: `performance-${Date.now()}`,
          volunteerId,
          collectionsCompleted: updates.collectionsCompleted || 0,
          onTimeDeliveryRate: updates.onTimeDeliveryRate || 100,
          averageRating: updates.averageRating || 5,
          lastUpdated: Date.now()
        };
        
        mockVolunteerPerformances.push(newPerformance);
        return newPerformance;
      }
      
      mockVolunteerPerformances[index] = { 
        ...mockVolunteerPerformances[index], 
        ...updates,
        lastUpdated: Date.now()
      };
      
      return mockVolunteerPerformances[index];
    },
  }
};

// Mock data
const mockUsers: User[] = [
  {
    id: 'hotel1',
    email: 'hotel@example.com',
    name: 'Grand Plaza Hotel',
    role: 'hotel',
    phone: '+91 9876543210',
    address: '123 Main Street, Koparkhairne, Navi Mumbai',
    location: {
      lat: 19.1036,
      lng: 73.0148,
    },
    profileComplete: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  },
  {
    id: 'ngo1',
    email: 'ngo@example.com',
    name: 'Food For All NGO',
    role: 'ngo',
    phone: '+91 9876543211',
    address: '456 Community Road, Koparkhairne, Navi Mumbai',
    location: {
      lat: 19.1040,
      lng: 73.0160,
    },
    profileComplete: true,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
  },
  {
    id: 'volunteer1',
    email: 'volunteer@example.com',
    name: 'Raj Kumar',
    role: 'volunteer',
    phone: '+91 9876543212',
    address: '789 Volunteer Avenue, Koparkhairne, Navi Mumbai',
    location: {
      lat: 19.1020,
      lng: 73.0155,
    },
    profileComplete: true,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
  },
];

// Update the mock food listings to have the correct properties
const mockFoodListings: FoodListing[] = [
  {
    id: 'listing1',
    hotelId: 'hotel1',
    hotelName: 'Grand Plaza Hotel',
    title: 'Mixed Vegetable Curry',
    foodName: 'Mixed Vegetable Curry',
    description: 'Freshly prepared vegetable curry with rice and naan bread. Serves approximately 20 people.',
    quantity: 20,
    servingSize: 20,
    quantityUnit: 'servings',
    expiry: '2025-04-20T18:00:00Z',
    preparationTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    expiryTime: Date.now() + 5 * 60 * 60 * 1000, // 5 hours from now
    fssaiNumber: 'FSSAI-12345-67890',
    dietaryInfo: {
      isVegetarian: true,
      isVegan: false,
      containsNuts: false,
      containsGluten: false,
      containsDairy: true,
    },
    location: {
      address: '123 Main Street, Koparkhairne, Navi Mumbai',
      lat: 19.1036,
      lng: 73.0148,
    },
    address: '123 Main Street, Koparkhairne, Navi Mumbai',
    status: 'available',
    createdAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
  },
  {
    id: 'listing2',
    hotelId: 'hotel1',
    hotelName: 'Grand Plaza Hotel',
    title: 'Chicken Biryani',
    foodName: 'Chicken Biryani',
    description: 'Aromatic rice dish with chicken. Approximately 15 servings available.',
    quantity: 15,
    servingSize: 15,
    quantityUnit: 'servings',
    expiry: '2025-04-20T17:00:00Z',
    preparationTime: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    expiryTime: Date.now() + 4 * 60 * 60 * 1000, // 4 hours from now
    fssaiNumber: 'FSSAI-12345-67890',
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      containsNuts: true,
      containsGluten: false,
      containsDairy: false,
    },
    location: {
      address: '123 Main Street, Koparkhairne, Navi Mumbai',
      lat: 19.1036,
      lng: 73.0148,
    },
    address: '123 Main Street, Koparkhairne, Navi Mumbai',
    status: 'assigned',
    assignedTo: {
      id: 'ngo1',
      name: 'Food For All NGO',
      role: 'ngo',
    },
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
];

const mockCollections: FoodCollection[] = [
  {
    id: 'collection1',
    foodListingId: 'listing2',
    hotelId: 'hotel1',
    ngoId: 'ngo1',
    volunteerId: 'volunteer1',
    pickupTime: Date.now() + 1 * 60 * 60 * 1000, // 1 hour from now
    status: 'scheduled',
    createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
  },
];

// Add mock volunteer training data
const mockVolunteerTrainings: VolunteerTraining[] = [
  {
    id: 'training1',
    volunteerId: 'volunteer1',
    trainingName: 'Food Safety Basics',
    completed: true,
    completedDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000, // valid for 6 months
    status: 'completed',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  },
  {
    id: 'training2',
    volunteerId: 'volunteer1',
    trainingName: 'Safe Driving Course',
    completed: false,
    status: 'in-progress',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  },
  {
    id: 'training3',
    volunteerId: 'volunteer1',
    trainingName: 'Food Storage Guidelines',
    completed: false,
    status: 'not-started',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  }
];

// Add mock volunteer performance data
const mockVolunteerPerformances: VolunteerPerformance[] = [
  {
    id: 'performance1',
    volunteerId: 'volunteer1',
    collectionsCompleted: 15,
    onTimeDeliveryRate: 94,
    averageRating: 4.7,
    lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'notification1',
    userId: 'hotel1',
    title: 'Food Listing Assigned',
    message: 'Your food listing "Chicken Biryani" has been assigned to Food For All NGO.',
    type: 'success',
    read: false,
    createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
  },
  {
    id: 'notification2',
    userId: 'ngo1',
    title: 'New Food Available',
    message: 'New food listing "Chicken Biryani" is available for collection.',
    type: 'info',
    read: false,
    createdAt: Date.now() - 32 * 60 * 1000, // 32 minutes ago
  },
  {
    id: 'notification3',
    userId: 'volunteer1',
    title: 'Collection Assignment',
    message: 'You have been assigned to help with a food collection.',
    type: 'info',
    read: true,
    createdAt: Date.now() - 25 * 60 * 1000, // 25 minutes ago
  },
];
