import { Clock, Truck, CheckCircle, Package } from 'lucide-react';

export const formatPrice = (price: number): string => {
  return `LKR ${price.toLocaleString()}`;
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processing':
      return Clock;
    case 'shipping':
      return Truck;
    case 'delivered':
      return CheckCircle;
    default:
      return Package;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'shipping':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};