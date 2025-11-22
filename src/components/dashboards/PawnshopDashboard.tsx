import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { Gavel, Clock, Users, TrendingUp } from 'lucide-react';

interface PawnshopDashboardProps {
  onNavigate: (path: string) => void;
}

export const PawnshopDashboard: React.FC<PawnshopDashboardProps> = ({ onNavigate }) => {
  const { user } = useApp();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pawnshop Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your auctions and bids.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Gavel className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Active Auctions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">15</div>
              <div className="text-sm text-muted-foreground">Ending Soon</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">243</div>
              <div className="text-sm text-muted-foreground">Total Bidders</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Full pawnshop auction management features are being developed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This dashboard will include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and manage live auctions</li>
                <li>Accept or reject bids from customers</li>
                <li>View detailed bid statistics and analytics</li>
                <li>Handle payment and item transfer</li>
                <li>Track auction performance metrics</li>
              </ul>
              <Button onClick={() => onNavigate('/auctions')} className="kgf-gradient text-white">
                View Live Auctions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};