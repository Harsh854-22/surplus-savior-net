
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import FoodDetail from "./pages/FoodDetail";
import AvailableFood from "./pages/AvailableFood";
import HotelDashboard from "./pages/hotel/Dashboard";
import CreateListing from "./pages/hotel/CreateListing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/food/:id" element={<FoodDetail />} />
            <Route path="/food/available" element={<AvailableFood />} />
            
            {/* Protected routes */}
            <Route path="/profile/setup" element={<ProfileSetup />} />
            
            {/* Hotel routes */}
            <Route path="/hotel/dashboard" element={<HotelDashboard />} />
            <Route path="/hotel/create-listing" element={<CreateListing />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
