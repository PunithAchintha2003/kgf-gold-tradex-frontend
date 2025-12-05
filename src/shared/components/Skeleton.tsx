import React from 'react';
import { cn } from '../../components/ui/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular',
  ...props 
}) => {
  const baseClasses = 'animate-pulse bg-muted';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
};

// Pre-built skeleton components for common use cases
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Skeleton className="h-64 w-full" variant="rectangular" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <Skeleton className="h-6 w-1/3" variant="text" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" variant="text" />
        </td>
      ))}
    </tr>
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 border rounded-lg space-y-3">
      <Skeleton className="h-4 w-1/3" variant="text" />
      <Skeleton className="h-8 w-1/2" variant="text" />
      <Skeleton className="h-3 w-2/3" variant="text" />
    </div>
  );
};


