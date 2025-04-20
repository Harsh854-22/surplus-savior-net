
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import FoodDetail from "./pages/FoodDetail";
import AvailableFood from "./pages/AvailableFood";
import HotelDashboard from "./pages/hotel/Dashboard";
import CreateListing from "./pages/hotel/CreateListing";
import NotFound from "./pages/NotFound";

// Creating missing pages
import HotelListings from "./pages/hotel/Listings";
import NGODashboard from "./pages/ngo/Dashboard";
import NGOCollections from "./pages/ngo/Collections";
import VolunteerDashboard from "./pages/volunteer/Dashboard";
import VolunteerSchedule from "./pages/volunteer/Schedule";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/food/:id" element={<Layout><FoodDetail /></Layout>} />
            <Route path="/food/available" element={<Layout><AvailableFood /></Layout>} />
            
            {/* Protected routes */}
            <Route 
              path="/profile/setup" 
              element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} 
            />
            <Route 
              path="/notifications" 
              element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<ProtectedRoute><Layout><ProfileSetup /></Layout></ProtectedRoute>} 
            />
            
            {/* Hotel routes */}
            <Route 
              path="/hotel/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['hotel']}>
                  <Layout><HotelDashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hotel/create-listing" 
              element={
                <ProtectedRoute allowedRoles={['hotel']}>
                  <Layout><CreateListing /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hotel/listings" 
              element={
                <ProtectedRoute allowedRoles={['hotel']}>
                  <Layout><HotelListings /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* NGO routes */}
            <Route 
              path="/ngo/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <Layout><NGODashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ngo/collections" 
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <Layout><NGOCollections /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Volunteer routes */}
            <Route 
              path="/volunteer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Layout><VolunteerDashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/volunteer/schedule" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Layout><VolunteerSchedule /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout><AdminUsers /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout><AdminSettings /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
