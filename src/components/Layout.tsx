
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on auth pages
  const hideNavbar = ['/login', '/register', '/profile/setup'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNavbar && <Navbar />}
      
      <main className="flex-1 transition-all duration-300 page-transition-in">
        {children}
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-2 sm:mb-0">
              &copy; {new Date().getFullYear()} Surplus Savior - Fighting food waste in Koparkhairne
            </p>
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/contact" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
