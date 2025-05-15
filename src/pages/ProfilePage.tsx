import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthRequired } from '../hooks/use-auth-required';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileForm } from '@/components/ProfileForm';
import { OrderTracking } from '@/components/OrderTracking';
import { AddressForm, type AddressFormData } from '@/components/AddressForm';

// Mock data for demonstration
const mockOrders = [
	{
		id: '1',
		orderNumber: 'ORD-2025-001',
		date: new Date('2025-05-10'),
		total: 299.98,
		status: 'shipped' as const,
		items: [
			{
				id: 'item1',
				name: 'Urban Runner X1',
				quantity: 1,
				price: 149.99,
				image: '/placeholder.svg',
			},
			{
				id: 'item2',
				name: 'Street Walker Pro',
				quantity: 1,
				price: 149.99,
				image: '/placeholder.svg',
			},
		],
		trackingNumber: '1Z999AA1234567890',
		trackingHistory: [
			{
				status: 'shipped',
				date: new Date('2025-05-12T10:00:00'),
				location: 'San Francisco, CA',
				description: 'Package in transit',
			},
			{
				status: 'processing',
				date: new Date('2025-05-11T15:30:00'),
				location: 'Warehouse',
				description: 'Package left warehouse',
			},
			{
				status: 'pending',
				date: new Date('2025-05-10T09:00:00'),
				location: 'Online',
				description: 'Order confirmed',
			},
		],
	},
	// Add more mock orders as needed
];

export function ProfilePage() {
	const { user, logout, updateProfile, addAddress, updateAddress, deleteAddress } = useAuth();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [isAddingAddress, setIsAddingAddress] = useState(false);
	const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('personal-info');

	// Protect this route
	const { isLoading } = useAuthRequired();

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-16 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	const handleProfileUpdate = async (values: any) => {
		try {
			await updateProfile(values);
			setIsEditing(false);
			toast.success('Profile updated successfully');
		} catch (error) {
			toast.error('Failed to update profile');
			console.error('Profile update error:', error);
		}
	};

	const handleLogout = () => {
		logout();
		toast.success('You have been logged out');
		navigate('/');
	};

	const handleAddressSubmit = async (data: AddressFormData) => {
		try {
			// Ensure all required fields are present for addAddress
			const requiredAddress = {
				street: data.street ?? '',
				city: data.city ?? '',
				state: data.state ?? '',
				zipCode: data.zipCode ?? '',
				country: data.country ?? '',
				isDefault: data.isDefault ?? false,
			};
			if (editingAddressId) {
				await updateAddress(editingAddressId, requiredAddress);
				toast.success('Address updated successfully');
			} else {
				await addAddress(requiredAddress);
				toast.success('Address added successfully');
			}
			setIsAddingAddress(false);
			setEditingAddressId(null);
		} catch (error) {
			toast.error(editingAddressId ? 'Failed to update address' : 'Failed to add address');
			console.error('Address operation error:', error);
		}
	};

	const handleDeleteAddress = async (id: string) => {
		try {
			await deleteAddress(id);
			toast.success('Address deleted successfully');
		} catch (error) {
			toast.error('Failed to delete address');
			console.error('Address deletion error:', error);
		}
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
					</CardContent>					<CardFooter>
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
							<TabsContent value="personal-info" className="mt-4 space-y-6">								<div>
									<h3 className="text-lg font-medium mb-2">Profile Information</h3>
									{isEditing ? (
										<ProfileForm
											onSubmit={handleProfileUpdate}
											onCancel={() => setIsEditing(false)}
											defaultValues={{
												firstName: user?.firstName || '',
												lastName: user?.lastName || '',
												email: user?.email || '',
											}}
										/>
									) : (
										<>
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
												<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
													Edit Profile
												</Button>
											</div>
										</>
									)}
								</div>

								<Separator />

								<div>
									<h3 className="text-lg font-medium mb-2">Password</h3>
									<p className="text-sm text-muted-foreground mb-2">
										Change your password to keep your account secure.
									</p>
									<Button variant="outline" size="sm">
										Change Password
									</Button>
								</div>
							</TabsContent>							<TabsContent value="shipping-info" className="mt-4">
								<div className="space-y-4">
									{user?.addresses?.map((address) => (
										<div key={address.id} className="rounded-md border p-4 relative">
											<div className="absolute top-3 right-3 space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setEditingAddressId(address.id);
														setIsAddingAddress(true);
													}}
												>
													Edit
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive"
													onClick={() => handleDeleteAddress(address.id)}
												>
													Delete
												</Button>
											</div>
											{address.isDefault && (
												<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mb-2">
													Default
												</span>
											)}
											<p className="font-medium">{address.street}</p>
											<p className="text-sm text-muted-foreground mt-1">
												{address.city}, {address.state} {address.zipCode}
											</p>
											<p className="text-sm text-muted-foreground">{address.country}</p>
										</div>
									))}
									{isAddingAddress ? (
										<AddressForm
											onSubmit={handleAddressSubmit}
											onCancel={() => {
												setIsAddingAddress(false);
												setEditingAddressId(null);
											}}
											defaultValues={
												editingAddressId
													? user?.addresses.find((addr) => addr.id === editingAddressId)
													: undefined
											}
										/>
									) : (
										<Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)}>
											Add New Address
										</Button>
									)}
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
