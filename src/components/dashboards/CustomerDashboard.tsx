import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../contexts/AppContext';
import { ShoppingBag, Heart, Clock, Award } from 'lucide-react';
import { mockOrders, mockWishlist, mockAuctions, mockMessages } from '../../constants/mockData';
import { OrdersList } from './components/OrdersList';
import { WishlistGrid } from './components/WishlistGrid';
import { AuctionsList } from './components/AuctionsList';
import { MessagesList } from './components/MessagesList';

interface CustomerDashboardProps {
  onNavigate: (path: string) => void;
  onOpenChat: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate, onOpenChat }) => {
  const { t, user } = useApp();

  const stats = [
    {
      icon: ShoppingBag,
      value: mockOrders.length,
      label: 'Total Orders',
      color: 'text-primary'
    },
    {
      icon: Heart,
      value: mockWishlist.length,
      label: 'Wishlist Items',
      color: 'text-red-500'
    },
    {
      icon: Clock,
      value: mockAuctions.length,
      label: 'Active Bids',
      color: 'text-blue-500'
    },
    {
      icon: Award,
      value: 1,
      label: 'Auctions Won',
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome')}, {user?.name}</h1>
          <p className="text-muted-foreground">
            Manage your orders, wishlist, and auction bids
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="auctions">My Bids</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Button variant="outline">View All Orders</Button>
            </div>
            <OrdersList orders={mockOrders} onOpenChat={onOpenChat} />
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Wishlist</h2>
              <Button variant="outline" onClick={() => onNavigate('/products')}>
                Browse Products
              </Button>
            </div>
            <WishlistGrid wishlist={mockWishlist} />
          </TabsContent>

          {/* Auctions Tab */}
          <TabsContent value="auctions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Bids</h2>
              <Button variant="outline" onClick={() => onNavigate('/auctions')}>
                Browse Auctions
              </Button>
            </div>
            <AuctionsList auctions={mockAuctions} onNavigate={onNavigate} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Messages</h2>
              <Button variant="outline" onClick={onOpenChat}>
                New Conversation
              </Button>
            </div>
            <MessagesList messages={mockMessages} onOpenChat={onOpenChat} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};