import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Clock, TrendingUp, Eye } from 'lucide-react';
import { ImageWithFallback } from '../../../shared/components/figma/ImageWithFallback';
import { formatPrice } from '../../../utils/dashboardUtils';

interface Auction {
  id: string | number;
  title: string;
  image: string;
  currentBid: number;
  timeLeft: number | string;
  status?: string;
  isWinning?: boolean;
  myBid?: number;
}

interface AuctionsListProps {
  auctions: Auction[];
  onNavigate: (path: string) => void;
}

export const AuctionsList: React.FC<AuctionsListProps> = ({ auctions, onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {auctions.map((auction) => (
          <Card key={auction.id} className="overflow-hidden">
            <div className="relative">
              <ImageWithFallback
                src={auction.image}
                alt={auction.title}
                className="w-full h-40 object-cover"
              />
              <Badge 
                className={`absolute top-3 right-3 ${
                  auction.isWinning 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {auction.isWinning ? 'Winning' : 'Outbid'}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{auction.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Bid:</span>
                  <span className="font-semibold">{formatPrice(auction.currentBid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">My Bid:</span>
                  <span className={auction.isWinning ? 'text-green-600' : 'text-red-600'}>
                    {formatPrice(auction.myBid || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Left:</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {auction.timeLeft}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onNavigate('/auctions')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Auction
                </Button>
                <Button 
                  className="flex-1 kgf-gradient text-white"
                  onClick={() => onNavigate('/auctions')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Place Bid
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};