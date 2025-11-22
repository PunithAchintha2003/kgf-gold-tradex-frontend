import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface InvestorDashboardProps {
  onNavigate: (path: string) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ onNavigate }) => {
  const { user } = useApp();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Digital Gold Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Monitor your digital gold investments.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">LKR 2.5M</div>
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">+12.5%</div>
              <div className="text-sm text-muted-foreground">Monthly Gain</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">45g</div>
              <div className="text-sm text-muted-foreground">Digital Gold</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <PieChart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Full digital gold investment features are being developed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This dashboard will include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Buy and sell digital gold instantly</li>
                <li>View comprehensive gold portfolio</li>
                <li>AI-powered gold price predictions</li>
                <li>Investment analytics and performance tracking</li>
                <li>Market trends and historical data</li>
              </ul>
              <Button onClick={() => onNavigate('/')} className="kgf-gradient text-white">
                View Gold Prices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};