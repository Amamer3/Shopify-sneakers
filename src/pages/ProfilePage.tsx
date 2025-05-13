
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthRequired } from '../hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, ShoppingBag, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Protect this route
  const { isLoading } = useAuthRequired();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleLogout = () => {
    logout();
    toast.success('You have been logged out');
    navigate('/');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              {user?.firstName || 'User'} {user?.lastName || ''}
            </CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start mb-2" asChild>
              <div>
                <User className="mr-2 h-4 w-4" />
                Profile
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start mb-2" asChild>
              <div onClick={() => navigate('/orders')}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Order History
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <div onClick={() => navigate('/payment-methods')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </div>
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </CardFooter>
        </Card>
      
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal-info">
              <TabsList>
                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                <TabsTrigger value="shipping-info">Shipping Info</TabsTrigger>
              </TabsList>
              <TabsContent value="personal-info" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">First Name</label>
                      <p>{user?.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Last Name</label>
                      <p>{user?.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Change your password to keep your account secure.
                  </p>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="shipping-info" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-md border p-4 relative">
                    <div className="absolute top-3 right-3">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <p className="font-medium">Default Address</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No default address set
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Add New Address</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
