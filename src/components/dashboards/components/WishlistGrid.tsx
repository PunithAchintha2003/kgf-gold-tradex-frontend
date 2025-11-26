import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from '../../../shared/components/figma/ImageWithFallback';
import { formatPrice } from '../../../utils/dashboardUtils';

interface WishlistGridProps {
  wishlist: any[];
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({ wishlist }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-square overflow-hidden">
            <ImageWithFallback
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{item.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{item.seller}</p>
            
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl font-bold text-primary">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                className="flex-1 kgf-gradient text-white"
                disabled={!item.inStock}
              >
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};