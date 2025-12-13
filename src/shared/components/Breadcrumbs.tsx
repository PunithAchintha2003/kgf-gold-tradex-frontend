import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  onNavigate,
  className 
}) => {
  const handleClick = (path: string | undefined) => {
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
              {item.path && !isLast ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClick(item.path)}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  {index === 0 && !item.icon && <Home className="h-4 w-4 mr-1" />}
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </Button>
              ) : (
                <span 
                  className={cn(
                    'flex items-center',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {index === 0 && !item.icon && <Home className="h-4 w-4 mr-1" />}
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};





