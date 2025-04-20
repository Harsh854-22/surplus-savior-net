
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Home,
  PlusCircle,
  CheckCircle,
  Users,
  Settings,
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const getNavLinks = () => {
    // Base links for all users
    const links = [
      { to: '/', label: 'Home', icon: <Home className="h-5 w-5" /> }
    ];
    
    // Role-specific links
    if (user) {
      switch(user.role) {
        case 'hotel':
          links.push(
            { to: '/hotel/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
            { to: '/hotel/create-listing', label: 'Create Listing', icon: <PlusCircle className="h-5 w-5" /> },
            { to: '/hotel/listings', label: 'My Listings', icon: <CheckCircle className="h-5 w-5" /> }
          );
          break;
        case 'ngo':
          links.push(
            { to: '/ngo/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
            { to: '/food/available', label: 'Available Food', icon: <PlusCircle className="h-5 w-5" /> },
            { to: '/ngo/collections', label: 'My Collections', icon: <CheckCircle className="h-5 w-5" /> }
          );
          break;
        case 'volunteer':
          links.push(
            { to: '/volunteer/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
            { to: '/volunteer/schedule', label: 'My Schedule', icon: <CheckCircle className="h-5 w-5" /> }
          );
          break;
        case 'admin':
          links.push(
            { to: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
            { to: '/admin/users', label: 'Manage Users', icon: <Users className="h-5 w-5" /> },
            { to: '/admin/settings', label: 'System Settings', icon: <Settings className="h-5 w-5" /> }
          );
          break;
      }
    }
    
    return links;
  };
  
  return (
    <nav className="border-b border-border sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-semibold text-primary flex items-center"
            >
              <span className="hidden md:inline mr-2">Surplus</span> 
              <span>Savior</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {getNavLinks().map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right side - Auth/Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/notifications')}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                </Button>
                
                {/* User Menu (Desktop) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name ? getInitials(user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Mobile Menu Toggle */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[240px] sm:w-[320px] py-6">
                    <div className="flex flex-col h-full">
                      <div className="mb-6">
                        <div className="flex items-center mb-4">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.name ? getInitials(user.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {getNavLinks().map((link, index) => (
                          <Link
                            key={index}
                            to={link.to}
                            className={`flex items-center py-2 px-3 text-sm rounded-md ${
                              location.pathname === link.to 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:bg-accent'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {link.icon && <span className="mr-3">{link.icon}</span>}
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      
                      <div className="mt-auto pt-6">
                        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-primary"
                >
                  Join Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
