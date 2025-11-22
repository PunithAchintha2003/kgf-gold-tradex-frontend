import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { Store, Package, TrendingUp, Users } from 'lucide-react';

interface SellerDashboardProps {
  onNavigate: (path: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate }) => {
  const { user } = useApp();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your gold products and sales.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Orders</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Store className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Full seller dashboard features are being developed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This dashboard will include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product inventory management</li>
                <li>Order processing and fulfillment</li>
                <li>Sales analytics and reports</li>
                <li>Customer communication tools</li>
                <li>Verification and certification tracking</li>
              </ul>
              <Button onClick={() => onNavigate('/products')} className="kgf-gradient text-white">
                Browse All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};