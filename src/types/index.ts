export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'LKR';
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'other';
  images: string[];
  karat: number;
  weight: number;
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
  };
  inStock: boolean;
  featured?: boolean;
}

export interface Auction {
  id: string;
  product: Product;
  currentBid: number;
  startingBid: number;
  endTime: string;
  bidCount: number;
  highestBidder?: {
    id: string;
    name: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'visitor' | 'buyer' | 'seller' | 'pawnshop' | 'investor' | 'admin';
  avatar?: string;
  isVerified: boolean;
}









