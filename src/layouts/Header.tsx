import React, { useMemo, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown_menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import { useApp } from '../contexts/AppContext';
import { Sun, Moon, Globe, User, Settings, LogOut, Menu, ShoppingCart } from 'lucide-react';
import { GiGoldBar } from 'react-icons/gi';
import { useGetRealtimePriceQuery, useGetExchangeRateQuery } from '../store/api/goldApi';
import { convertTroyOunceToPawn } from '../utils/currencyConverter';
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';
import { buildPublicNavItems } from './publicNav.config';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onNavigate, currentPath }) => {
  const { theme, toggleTheme, language, setLanguage, t, user, isAuthenticated, logout } = useApp();
  const { itemCount, openCart, isOpen: cartOpen } = useCart();

  // Fetch real-time gold price
  const { data: realtimeData } = useGetRealtimePriceQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Fetch USD/LKR exchange rate
  const { data: exchangeRateData } = useGetExchangeRateQuery({ from: 'USD', to: 'LKR' }, {
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
  }, [realtimeData?.current_price, exchangeRateData?.exchange_rate]);

  const publicNavItems = useMemo(() => buildPublicNavItems(t), [t]);

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

  /** Spacing after login: flex gap/ms can fail with Radix — use real flex items with fixed width. */
  const wideUtilitySpacers = Boolean(isAuthenticated);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 w-full min-w-0 items-center">
          {/* Logo */}
          <div 
            className="flex shrink-0 cursor-pointer items-center"
            onClick={handleHomeClick}
          >
            <img 
              src={logoImage} 
              alt="KGF Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop nav: flex-1 + min-w-0 absorbs overflow; utilities stay shrink-0 at the container edge */}
          <nav className="mx-2 hidden min-h-0 min-w-0 flex-1 justify-center overflow-x-auto md:flex">
            <div className="flex items-center gap-2 lg:gap-6">
              {publicNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`flex shrink-0 items-center space-x-1 rounded-md px-3 py-2 transition-colors lg:px-4 ${
                    currentPath === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Utilities: fixed-width spacers between clusters (reliable with Radix portals/triggers) */}
          <div className="ml-auto flex min-w-0 shrink-0 flex-nowrap items-center md:ml-0">
              {/* Gold Price Display */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex shrink-0 items-center space-x-3 px-3 py-1.5 rounded-md bg-primary/10 text-primary font-semibold cursor-help"
                    role="status"
                    aria-label={`Current ${goldPriceData.karat} gold price: ${goldPriceData.price}`}
                  >
                    {/* 24K with Gold Icon */}
                    <div className="flex items-center space-x-1.5">
                      <GiGoldBar 
                        style={{ 
                          color: '#F5D300',  
                        }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold">{goldPriceData.karat}</span>
                    </div>
                    {/* Separator */}
                    <span className="text-primary/50" aria-hidden="true">|</span>
                    {/* LKR Price */}
                    <span className="text-sm whitespace-nowrap">{goldPriceData.price || 'LKR 310K'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Live gold price per 1 Pawn (24K)</p>
                  <p className="text-xs text-muted-foreground mt-1">Updates every 10 seconds</p>
                </TooltipContent>
              </Tooltip>

              <div
                aria-hidden
                className={
                  wideUtilitySpacers
                    ? 'w-5 shrink-0 sm:w-8 md:w-12 lg:w-14'
                    : 'w-2 shrink-0 sm:w-3'
                }
              />

              {/* Shopping cart — opens cart drawer */}
              <div className="flex shrink-0 items-center border-l border-border/60 pl-2 sm:pl-3 md:pl-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCart()}
                      aria-label="Shopping cart"
                      title="Shopping cart"
                      className={`relative ${cartOpen ? 'text-primary' : ''}`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {itemCount > 0 ? (
                        <Badge
                          variant="secondary"
                          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-background px-1 text-[10px] font-semibold leading-none"
                        >
                          {itemCount > 99 ? '99+' : itemCount}
                        </Badge>
                      ) : null}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View cart{itemCount > 0 ? ` (${itemCount})` : ''}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Language Switcher */}
              <div className="flex shrink-0 items-center pl-1 sm:pl-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      aria-label={`Current language: ${language === 'en' ? 'English' : 'Sinhala'}. Click to change language.`}
                      title="Change language"
                    >
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
              </div>

              <div
                aria-hidden
                className={
                  wideUtilitySpacers
                    ? 'w-4 shrink-0 sm:w-7 md:w-10 lg:w-12'
                    : 'w-2 shrink-0 sm:w-3'
                }
              />

              {/* Theme Toggle */}
              <div className="flex shrink-0 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleTheme}
                      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to {theme === 'light' ? 'dark' : 'light'} mode</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div
                aria-hidden
                className={
                  wideUtilitySpacers
                    ? 'w-4 shrink-0 sm:w-7 md:w-10 lg:w-12'
                    : 'w-2 shrink-0 sm:w-3'
                }
              />

              {/* User Menu */}
              <div className="flex shrink-0 items-center">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="relative h-10 w-10 rounded-full"
                        aria-label={`User menu for ${user.name}`}
                        title={`${user.name} (${user.role})`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.role !== 'buyer' && (
                          <Badge className={`text-xs w-fit ${roleColors[user.role]}`}>
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      {roleBasedDashboard && user.role !== 'buyer' && (
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
                    <Button 
                      variant="ghost" 
                      onClick={() => onNavigate('/login')}
                      aria-label="Sign in to your account"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button 
                      onClick={() => onNavigate('/register')}
                      aria-label="Create a new account"
                    >
                      {t('nav.register')}
                    </Button>
                  </div>
                )}
              </div>

              <div
                aria-hidden
                className={wideUtilitySpacers ? 'w-3 shrink-0 sm:w-5 md:w-6' : 'w-2 shrink-0'}
              />

              {/* Mobile Menu */}
              <div className="flex shrink-0 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    aria-label="Open navigation menu"
                    title="Navigation menu"
                    className="mr-0"
                  >
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
      </div>
    </header>
  );
});

Header.displayName = 'Header';