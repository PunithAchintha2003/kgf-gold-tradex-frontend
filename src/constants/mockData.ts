export const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    items: [
      {
        name: 'Royal Crown Ring',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop',
        price: 125000,
        quantity: 1
      }
    ],
    total: 125000,
    status: 'delivered',
    tracking: 'TRK001',
    seller: 'Golden Palace'
  },
  {
    id: 'ORD-002',
    date: '2024-01-20',
    items: [
      {
        name: 'Heritage Necklace',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop',
        price: 85000,
        quantity: 1
      }
    ],
    total: 85000,
    status: 'shipping',
    tracking: 'TRK002',
    seller: 'Royal Jewelers'
  },
  {
    id: 'ORD-003',
    date: '2024-01-22',
    items: [
      {
        name: 'Diamond Earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop',
        price: 65000,
        quantity: 1
      }
    ],
    total: 65000,
    status: 'processing',
    tracking: 'TRK003',
    seller: 'Gem Palace'
  }
];

export const mockWishlist = [
  {
    id: 1,
    name: 'Traditional Kada',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=150&h=150&fit=crop',
    price: 95000,
    originalPrice: 110000,
    seller: 'Heritage Gold',
    inStock: true
  },
  {
    id: 2,
    name: 'Elegant Chain',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&h=150&fit=crop',
    price: 45000,
    seller: 'Modern Gold',
    inStock: false
  }
];

export const mockAuctions = [
  {
    id: 1,
    title: 'Antique Gold Bracelet',
    image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=150&h=150&fit=crop',
    currentBid: 45000,
    myBid: 43000,
    timeLeft: '2h 34m',
    status: 'leading',
    isWinning: false
  },
  {
    id: 2,
    title: 'Vintage Ring Set',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=150&h=150&fit=crop',
    currentBid: 75000,
    myBid: 75000,
    timeLeft: '1d 5h',
    status: 'winning',
    isWinning: true
  }
];

export const mockMessages = [
  {
    id: 1,
    seller: 'Golden Palace',
    lastMessage: 'Your order has been shipped!',
    timestamp: '2024-01-23T10:30:00Z',
    unread: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 2,
    seller: 'Royal Jewelers',
    lastMessage: 'Thank you for your purchase.',
    timestamp: '2024-01-22T15:45:00Z',
    unread: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  }
];