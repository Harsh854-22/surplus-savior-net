
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed, Users, Heart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { FoodListing } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { MapView } from '@/components/MapView';

const Index = () => {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const listings = await db.foodListings.getAll();
        setRecentListings(listings.slice(0, 3));
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentListings();
  }, []);

  const features = [
    {
      icon: <UtensilsCrossed className="h-6 w-6" />,
      title: 'List Surplus Food',
      description: 'Hotels and restaurants can easily list their surplus food with expiry details.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Help Communities',
      description: 'NGOs and charities can find and collect food for those who need it most.',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Volunteer',
      description: 'Join as a volunteer to help with food collection and distribution.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Track Impact',
      description: 'Monitor your contribution to reducing food waste and helping others.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"
        ></div>
        
        <div className="content-container relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block animate-fade-in">
              <div className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                Koparkhairne, Navi Mumbai
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              Connecting Surplus Food <br className="hidden sm:block" />
              <span className="text-primary">with Those in Need</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Our platform connects hotels and shops with surplus food to NGOs and communities that need it, 
              reducing waste and fighting hunger in our community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-primary hover:bg-primary/90"
              >
                Join Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to connect surplus food with those who need it,
              while ensuring safety and compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card transition-all hover:shadow-md"
              >
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Food Available Now</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See food listings available in Koparkhairne, Navi Mumbai and connect with
              donors and recipients in your area.
            </p>
          </div>
          
          <div className="mb-8">
            <MapView 
              listings={recentListings}
              currentLocation={recentListings.length > 0 ? recentListings[0].location : undefined}
              onMarkerClick={(listing) => navigate(`/food/${listing.id}`)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-[360px] animate-pulse rounded-lg bg-muted"></div>
              ))
            ) : (
              recentListings.map(listing => (
                <FoodCard 
                  key={listing.id} 
                  listing={listing}
                  onClaim={() => navigate(`/food/${listing.id}`)}
                />
              ))
            )}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/food/available')}
              className="mt-4"
            >
              View All Available Food
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="content-container">
          <div className="rounded-2xl p-8 md:p-12 bg-card border border-border relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 h-40 w-40 rounded-full bg-primary/10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-60 w-60 rounded-full bg-primary/5"></div>
            
            <div className="relative z-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
                <p className="text-muted-foreground mb-8">
                  Join our community of hotels, restaurants, NGOs, and volunteers in Koparkhairne 
                  to help reduce food waste and support those in need.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => navigate('/register')}>Get Started</Button>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
