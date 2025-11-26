import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useApp } from '../contexts/AppContext';
import { Clock, Gavel, Users, Eye, Heart, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';

interface AuctionsPageProps {
  onNavigate: (path: string) => void;
}

export const AuctionsPage: React.FC<AuctionsPageProps> = ({ onNavigate }) => {
  const { t, isAuthenticated } = useApp();
  const [bidAmount, setBidAmount] = useState('');
  const [auctions, setAuctions] = useState([
    {
      id: 1,
      title: 'Antique Gold Bracelet',
      description: 'Beautiful handcrafted antique gold bracelet with intricate designs',
      startingBid: 35000,
      currentBid: 45000,
      nextMinimum: 47000,
      timeLeft: 2 * 3600 + 34 * 60, // 2h 34m in seconds
      image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=300&fit=crop',
      bidders: 12,
      watchers: 45,
      seller: 'Heritage Pawnshop',
      purity: '22K',
      weight: '25.4g',
      condition: 'Excellent',
      isEnding: true,
      category: 'bracelets'
    },
    {
      id: 2,
      title: 'Traditional Kada',
      description: 'Traditional solid gold kada with cultural significance',
      startingBid: 25000,
      currentBid: 32000,
      nextMinimum: 34000,
      timeLeft: 1 * 3600 + 15 * 60, // 1h 15m in seconds
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop',
      bidders: 8,
      watchers: 23,
      seller: 'Golden Heritage',
      purity: '22K',
      weight: '30.2g',
      condition: 'Very Good',
      isEnding: true,
      category: 'bracelets'
    },
    {
      id: 3,
      title: 'Diamond Ring Set',
      description: 'Elegant diamond ring set with matching wedding bands',
      startingBid: 125000,
      currentBid: 165000,
      nextMinimum: 170000,
      timeLeft: 5 * 3600 + 22 * 60, // 5h 22m in seconds
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=300&fit=crop',
      bidders: 24,
      watchers: 78,
      seller: 'Royal Pawnshop',
      purity: '18K',
      weight: '12.8g',
      condition: 'Like New',
      isEnding: false,
      category: 'rings'
    },
    {
      id: 4,
      title: 'Pearl Necklace',
      description: 'Premium pearl necklace with gold chain and clasp',
      startingBid: 55000,
      currentBid: 68000,
      nextMinimum: 70000,
      timeLeft: 3 * 3600 + 45 * 60, // 3h 45m in seconds
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      bidders: 15,
      watchers: 34,
      seller: 'Pearl Paradise',
      purity: '18K',
      weight: '18.5g',
      condition: 'Excellent',
      isEnding: false,
      category: 'necklaces'
    }
  ]);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prev => prev.map(auction => ({
        ...auction,
        timeLeft: Math.max(0, auction.timeLeft - 1)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const handlePlaceBid = (auctionId: number) => {
    if (!isAuthenticated) {
      alert('Please login to place bids');
      onNavigate('/login');
      return;
    }

    const auction = auctions.find(a => a.id === auctionId);
    const amount = parseInt(bidAmount);
    
    if (!auction || amount < auction.nextMinimum) {
      alert(`Minimum bid is ${formatPrice(auction?.nextMinimum || 0)}`);
      return;
    }

    // Simulate bid placement
    setAuctions(prev => prev.map(a => 
      a.id === auctionId 
        ? { ...a, currentBid: amount, nextMinimum: amount + 2000, bidders: a.bidders + 1 }
        : a
    ));
    
    setBidAmount('');
    alert('Bid placed successfully!');
  };

  const getTimeLeftColor = (timeLeft: number) => {
    if (timeLeft < 3600) return 'text-red-600'; // Less than 1 hour
    if (timeLeft < 7200) return 'text-yellow-600'; // Less than 2 hours
    return 'text-green-600';
  };

  const getBidProgress = (auction: any) => {
    return Math.min(100, ((auction.currentBid - auction.startingBid) / auction.startingBid) * 100);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('auctions.title')}</h1>
          <p className="text-muted-foreground">
            Bid on premium gold items from verified pawnshops
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{auctions.length}</div>
              <div className="text-sm text-muted-foreground">Live Auctions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {auctions.filter(a => a.isEnding).length}
              </div>
              <div className="text-sm text-muted-foreground">Ending Soon</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {auctions.reduce((sum, a) => sum + a.bidders, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Bidders</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(Math.max(...auctions.map(a => a.currentBid))).replace('LKR ', '')}
              </div>
              <div className="text-sm text-muted-foreground">Highest Bid</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="cursor-pointer">All Categories</Badge>
          <Badge variant="outline" className="cursor-pointer">Rings</Badge>
          <Badge variant="outline" className="cursor-pointer">Necklaces</Badge>
          <Badge variant="outline" className="cursor-pointer">Bracelets</Badge>
          <Badge variant="outline" className="cursor-pointer">Earrings</Badge>
          <Badge variant="outline" className="cursor-pointer">Ending Soon</Badge>
        </div>

        {/* Auctions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  {auction.isEnding && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      Ending Soon
                    </Badge>
                  )}
                  <Badge className="bg-green-500 text-white">
                    Live Auction
                  </Badge>
                </div>

                {/* Watchers */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Eye className="h-3 w-3 mr-1" />
                    {auction.watchers}
                  </Badge>
                </div>

                {/* Time Left Overlay */}
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className={`font-medium ${getTimeLeftColor(auction.timeLeft)}`}>
                      {formatTime(auction.timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{auction.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {auction.description}
                    </p>
                  </div>

                  {/* Seller and Specs */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{auction.seller}</span>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{auction.purity}</Badge>
                      <Badge variant="outline">{auction.weight}</Badge>
                    </div>
                  </div>

                  {/* Bid Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Starting: {formatPrice(auction.startingBid)}</span>
                      <span className="text-green-600">
                        +{getBidProgress(auction).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={getBidProgress(auction)} className="h-2" />
                  </div>

                  {/* Current Bid */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Bid</span>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {auction.bidders} bidders
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(auction.currentBid)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next minimum: {formatPrice(auction.nextMinimum)}
                    </div>
                  </div>

                  {/* Bid Input */}
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder={`Min: ${auction.nextMinimum.toLocaleString()}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handlePlaceBid(auction.id)}
                      className="kgf-gradient text-white"
                    >
                      <Gavel className="h-4 w-4 mr-1" />
                      Bid
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      Watch
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auction Rules */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Auction Rules & Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Bidding Rules</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Minimum bid increment: LKR 2,000</li>
                  <li>• All bids are binding and final</li>
                  <li>• Auction extends by 2 minutes if bid placed in last 30 seconds</li>
                  <li>• Winner must complete payment within 24 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Item Authentication</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• All items verified by certified appraisers</li>
                  <li>• Purity certificates included with purchase</li>
                  <li>• 7-day return policy for authenticity issues</li>
                  <li>• Insurance coverage during shipping</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};