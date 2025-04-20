
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Settings, 
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// This would come from a real charting library in a complete app
const LineChartPlaceholder: React.FC = () => (
  <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
    <LineChart className="h-12 w-12 text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Activity Chart</span>
  </div>
);

const PieChartPlaceholder: React.FC = () => (
  <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
    <PieChart className="h-12 w-12 text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Distribution Chart</span>
  </div>
);

const BarChartPlaceholder: React.FC = () => (
  <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
    <BarChart3 className="h-12 w-12 text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Statistics Chart</span>
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage the entire food redistribution platform.
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button onClick={() => navigate('/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">1,274</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">43</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +5% from last week
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">178</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  -2% from last month
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Sign-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  +18% from last week
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartPlaceholder />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartPlaceholder />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Food Saved (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartPlaceholder />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Detailed analytics and insights about platform usage, donations, and impact metrics.
                </p>
                <Button onClick={() => {}}>
                  Generate Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <LineChart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Report Generation</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create and export detailed reports about platform activity, user engagement, and donation metrics.
                </p>
                <Button onClick={() => {}}>
                  Create New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  action: "New food listing created", 
                  user: "Grand Hotel", 
                  time: "10 minutes ago",
                },
                { 
                  action: "Food donation completed", 
                  user: "Hope NGO", 
                  time: "1 hour ago",
                },
                { 
                  action: "New volunteer registered", 
                  user: "Rahul Sharma", 
                  time: "3 hours ago",
                },
                { 
                  action: "Food listing claimed", 
                  user: "Care Foundation", 
                  time: "5 hours ago",
                },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">By {item.user}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => navigate('/admin/users/add')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
              <Button className="w-full justify-start" onClick={() => navigate('/admin/users')}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
