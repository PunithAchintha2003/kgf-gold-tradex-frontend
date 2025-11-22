import React, { useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown_menu';
import { Badge } from './ui/badge';
import { useApp } from '../contexts/AppContext';
import { Sun, Moon, Globe, ShoppingCart, Gavel, User, Settings, LogOut, Menu, TrendingUp } from 'lucide-react';
import { GiGoldBar } from 'react-icons/gi';
import { useGetRealtimePriceQuery, useGetExchangeRateQuery } from '../store/api/goldApi';
import { convertTroyOunceToPawn } from '../utils/currencyConverter';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onNavigate, currentPath }) => {
  const { theme, toggleTheme, language, setLanguage, t, user, isAuthenticated, logout } = useApp();

  // Fetch real-time gold price
  const { data: realtimeData, isLoading: priceLoading } = useGetRealtimePriceQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Fetch USD/LKR exchange rate
  const { data: exchangeRateData, isLoading: rateLoading } = useGetExchangeRateQuery({ from: 'USD', to: 'LKR' }, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  // Calculate and format 24K gold price in LKR per 1 Pawn
  const goldPriceData = useMemo(() => {
    // Use fallback values if API is still loading or failed
    const currentPrice = realtimeData?.current_price || 2650; // Fallback USD per troy ounce
    const exchangeRate = exchangeRateData?.exchange_rate || 300; // Fallback LKR rate
    
    let converted;
    if (!realtimeData?.current_price || !exchangeRateData?.exchange_rate) {
      // Still show fallback price if API fails
      converted = convertTroyOunceToPawn(currentPrice, exchangeRate);
    } else {
      converted = convertTroyOunceToPawn(realtimeData.current_price, exchangeRateData.exchange_rate);
    }
    
    return {
      karat: '24K',
      price: converted.displayText // This will be "LKR 310K" format
    };
  }, [realtimeData?.current_price, exchangeRateData?.exchange_rate, priceLoading, rateLoading]);

  const publicNavItems = useMemo(() => [
    { path: '/', label: t('nav.home'), icon: null },
    { path: '/products', label: t('nav.products'), icon: null },
    { path: '/auctions', label: t('nav.auctions'), icon: Gavel },
    { path: '/price-predictor', label: 'Predictor', icon: TrendingUp },
    { path: '/about', label: t('nav.about'), icon: null },
    { path: '/contact', label: t('nav.contact'), icon: null },
  ], [t]);

  const roleBasedDashboard = useMemo(() => {
    if (!user) return null;
    switch (user.role) {
      case 'buyer':
        return { path: '/dashboard/customer', label: t('nav.dashboard') };
      case 'seller':
        return { path: '/dashboard/seller', label: 'Seller Dashboard' };
      case 'pawnshop':
        return { path: '/dashboard/pawnshop', label: 'Pawnshop Dashboard' };
      case 'investor':
        return { path: '/dashboard/investor', label: 'Investor Dashboard' };
      case 'admin':
        return { path: '/dashboard/admin', label: 'Admin Dashboard' };
      default:
        return null;
    }
  }, [user, t]);

  const roleColors = useMemo(() => ({
    buyer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    seller: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pawnshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    investor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    visitor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }), []);

  const handleHomeClick = useCallback(() => {
    onNavigate('/');
  }, [onNavigate]);

  const handleLanguageChange = useCallback((lang: 'en' | 'si') => {
    setLanguage(lang);
  }, [setLanguage]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={handleHomeClick}
          >
            <img 
              src={logoImage} 
              alt="KGF Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {publicNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${
                  currentPath === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-6">
            {/* Gold Price Display */}
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-md bg-primary/10 text-primary font-semibold">
              {/* 24K with Gold Icon */}
              <div className="flex items-center space-x-1.5">
                <GiGoldBar 
                  style={{ 
                    color: '#F5D300',  
                  }} 
                />
                <span className="text-sm font-bold">{goldPriceData.karat}</span>
              </div>
              {/* Separator */}
              <span className="text-primary/50">|</span>
              {/* LKR Price */}
              <span className="text-sm whitespace-nowrap">{goldPriceData.price || 'LKR 310K'}</span>
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('si')}>
                  සිංහල
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge className={`text-xs w-fit ${roleColors[user.role]}`}>
                      {user.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  {roleBasedDashboard && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate(roleBasedDashboard.path)}>
                        <Settings className="mr-2 h-4 w-4" />
                        {roleBasedDashboard.label}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => onNavigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => onNavigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button onClick={() => onNavigate('/register')}>
                  {t('nav.register')}
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {publicNavItems.map((item) => (
                  <DropdownMenuItem key={item.path} onClick={() => onNavigate(item.path)}>
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';