
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Save, Trash } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'Surplus Savior',
    contactEmail: 'admin@surplussavior.org',
    supportPhone: '+91 9876543210',
    defaultLocationLat: '19.1030',
    defaultLocationLng: '73.0148',
    notificationEmail: 'notifications@surplussavior.org'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dailyDigest: false,
    adminAlerts: true
  });
  
  const [apiKeys, setApiKeys] = useState({
    googleMapsApiKey: 'AIzaSyDHC0ImQ3BtT7Ha0g6DTHIGP45fmPcb4bM',
    smsApiKey: '••••••••••••••••',
    firebaseApiKey: '••••••••••••••••',
  });
  
  const handleGeneralSettingSave = () => {
    // In a real app, would save to database
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };
  
  const handleNotificationSettingSave = () => {
    // In a real app, would save to database
    toast({
      title: "Settings Saved",
      description: "Notification settings have been updated successfully.",
    });
  };
  
  const handleApiKeySave = () => {
    // In a real app, would save to database
    toast({
      title: "API Keys Saved",
      description: "API keys have been updated successfully.",
    });
  };
  
  const handleClearCache = () => {
    // In a real app, would clear cache
    toast({
      title: "Cache Cleared",
      description: "Application cache has been cleared successfully.",
    });
  };
  
  const updateGeneralSetting = (key: string, value: string) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateNotificationSetting = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateApiKey = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">System Settings</h1>
      <p className="text-muted-foreground mb-8">
        Configure platform-wide settings and integrations.
      </p>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic platform settings and information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input 
                    id="platformName" 
                    value={generalSettings.platformName}
                    onChange={(e) => updateGeneralSetting('platformName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => updateGeneralSetting('contactEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input 
                    id="supportPhone"
                    value={generalSettings.supportPhone}
                    onChange={(e) => updateGeneralSetting('supportPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input 
                    id="notificationEmail"
                    type="email"
                    value={generalSettings.notificationEmail}
                    onChange={(e) => updateGeneralSetting('notificationEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLocationLat">Default Location (Latitude)</Label>
                  <Input 
                    id="defaultLocationLat"
                    value={generalSettings.defaultLocationLat}
                    onChange={(e) => updateGeneralSetting('defaultLocationLat', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLocationLng">Default Location (Longitude)</Label>
                  <Input 
                    id="defaultLocationLng"
                    value={generalSettings.defaultLocationLng}
                    onChange={(e) => updateGeneralSetting('defaultLocationLng', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleGeneralSettingSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences for users and administrators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notification emails for important events</p>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                </div>
                <Switch 
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dailyDigest">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Send daily summary of platform activity</p>
                </div>
                <Switch 
                  id="dailyDigest"
                  checked={notificationSettings.dailyDigest}
                  onCheckedChange={(checked) => updateNotificationSetting('dailyDigest', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminAlerts">Admin Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send critical system alerts to administrators</p>
                </div>
                <Switch 
                  id="adminAlerts"
                  checked={notificationSettings.adminAlerts}
                  onCheckedChange={(checked) => updateNotificationSetting('adminAlerts', checked)}
                />
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Email Template Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure templates used for system emails.
                </p>
                <Button variant="outline">Manage Email Templates</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleNotificationSettingSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage integration keys for third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  API keys are sensitive information. Never share them publicly.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="googleMapsApiKey">Google Maps API Key</Label>
                <Input 
                  id="googleMapsApiKey" 
                  value={apiKeys.googleMapsApiKey}
                  onChange={(e) => updateApiKey('googleMapsApiKey', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smsApiKey">SMS Gateway API Key</Label>
                <Input 
                  id="smsApiKey" 
                  type="password"
                  value={apiKeys.smsApiKey}
                  onChange={(e) => updateApiKey('smsApiKey', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firebaseApiKey">Firebase API Key</Label>
                <Input 
                  id="firebaseApiKey" 
                  type="password"
                  value={apiKeys.firebaseApiKey}
                  onChange={(e) => updateApiKey('firebaseApiKey', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleApiKeySave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>
                Manage system maintenance and cleanup tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pb-4 border-b">
                <h3 className="font-medium mb-2">System Cache</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clear application cache to refresh data and fix display issues.
                </p>
                <Button variant="outline" onClick={handleClearCache}>Clear Cache</Button>
              </div>
              
              <div className="pb-4 border-b">
                <h3 className="font-medium mb-2">Database Backup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a backup of the system database.
                </p>
                <Button variant="outline">Create Backup</Button>
              </div>
              
              <div className="pb-4">
                <h3 className="font-medium mb-2">Data Cleanup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove old data to optimize database performance.
                </p>
                <Button variant="outline">Run Cleanup</Button>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions can cause data loss and cannot be undone.
                </p>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Reset Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
