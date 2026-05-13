import type { LucideIcon } from 'lucide-react';
import { Gavel, TrendingUp } from 'lucide-react';

export interface PublicNavItem {
  path: string;
  label: string;
  icon: LucideIcon | null;
}

/** Same primary routes as the global app header (single source of truth). */
export function buildPublicNavItems(t: (key: string) => string): PublicNavItem[] {
  return [
    { path: '/', label: t('nav.home'), icon: null },
    { path: '/products', label: t('nav.products'), icon: null },
    { path: '/auctions', label: t('nav.auctions'), icon: Gavel },
    { path: '/price-predictor', label: 'Predictor', icon: TrendingUp },
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/about', label: t('nav.about'), icon: null },
    { path: '/contact', label: t('nav.contact'), icon: null },
  ];
}
