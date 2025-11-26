import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Eye, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from '../../../shared/components/figma/ImageWithFallback';
import { formatPrice, getStatusIcon, getStatusColor, formatDate } from '../../../utils/dashboardUtils';

interface OrdersListProps {
  orders: any[];
  onOpenChat: () => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, onOpenChat }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);
        
        return (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{order.id}</span>
                    <Badge className={getStatusColor(order.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ordered on {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    by {order.seller}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                  <Button variant="outline" size="sm" onClick={onOpenChat}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
                {order.status === 'delivered' && (
                  <Button size="sm" className="kgf-gradient text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Rate Product
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};