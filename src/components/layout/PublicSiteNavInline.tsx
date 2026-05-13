import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { buildPublicNavItems } from '../../layouts/publicNav.config';
import { cn } from '../ui/utils';

interface PublicSiteNavInlineProps {
  onNavigate: (path: string) => void;
  currentPath: string;
  className?: string;
}

/**
 * Compact copy of the global header’s primary links, for toolbars (e.g. predictor chart row)
 * so MUI-heavy pages still expose the same site navigation as other routes.
 */
export const PublicSiteNavInline: React.FC<PublicSiteNavInlineProps> = ({
  onNavigate,
  currentPath,
  className,
}) => {
  const { t } = useApp();
  const items = useMemo(() => buildPublicNavItems(t), [t]);

  return (
    <nav
      className={cn(
        'flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5 sm:gap-2 lg:gap-3',
        className,
      )}
      aria-label="Primary pages"
    >
      {items.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => onNavigate(item.path)}
          className={cn(
            'flex shrink-0 items-center space-x-1 rounded-md px-2 py-1.5 text-sm transition-colors sm:px-3',
            currentPath === item.path
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.icon && <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
