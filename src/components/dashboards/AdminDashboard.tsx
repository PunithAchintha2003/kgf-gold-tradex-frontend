import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { Users, Shield, Gavel, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useApp();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage the entire KGF platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Verified Sellers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Gavel className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Active Auctions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">LKR 45M</div>
              <div className="text-sm text-muted-foreground">Monthly Volume</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">7</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Control Panel</CardTitle>
            <CardDescription>
              Full administrative features are being developed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This dashboard will include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>User and seller management with approval workflows</li>
                <li>Auction moderation and oversight tools</li>
                <li>Platform analytics and performance metrics</li>
                <li>Content moderation and policy enforcement</li>
                <li>Financial reporting and transaction monitoring</li>
                <li>System health monitoring and alerts</li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <Button onClick={() => onNavigate('/products')} variant="outline">
                  Manage Products
                </Button>
                <Button onClick={() => onNavigate('/auctions')} variant="outline">
                  Monitor Auctions
                </Button>
                <Button onClick={() => onNavigate('/')} className="kgf-gradient text-white">
                  Platform Overview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};