import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { store } from '../store';
import { setTheme as setReduxTheme } from '../store/slices/themeSlice';

// Types
export type UserRole = 'visitor' | 'buyer' | 'seller' | 'pawnshop' | 'investor' | 'admin';
export type Language = 'en' | 'si';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
}

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // User
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// Translations
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.auctions': 'Auctions',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.buy': 'Buy',
    'common.sell': 'Sell',
    'common.bid': 'Bid',
    'common.price': 'Price',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    
    // Home
    'home.hero.title': 'KGF - Unified Gold Marketplace',
    'home.hero.subtitle': 'Trade gold, invest digitally, and discover premium jewelry with AR try-on',
    'home.hero.cta': 'Start Trading',
    'home.features.title': 'Why Choose KGF?',
    'home.features.verified': 'Verified Sellers',
    'home.features.ar': 'AR Try-On',
    'home.features.realtime': 'Real-time Auctions',
    'home.features.digital': 'Digital Gold Investment',
    
    // Products
    'products.title': 'Gold Products',
    'products.category.rings': 'Rings',
    'products.category.necklaces': 'Necklaces',
    'products.category.earrings': 'Earrings',
    'products.category.bracelets': 'Bracelets',
    'products.tryar': 'Try with AR',
    
    // Auctions
    'auctions.title': 'Live Auctions',
    'auctions.ending': 'Ending Soon',
    'auctions.bid.current': 'Current Bid',
    'auctions.bid.place': 'Place Bid',
    'auctions.time.left': 'Time Left',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.orders': 'Orders',
    'dashboard.sales': 'Sales',
    'dashboard.bids': 'Bids',
    'dashboard.portfolio': 'Portfolio',
    'dashboard.analytics': 'Analytics',
    'dashboard.users': 'Users',
    'dashboard.approvals': 'Approvals',
  },
  si: {
    // Navigation
    'nav.home': 'මුල් පිටුව',
    'nav.products': 'භණ්ඩ',
    'nav.auctions': 'වෙන්දේසි',
    'nav.about': 'අපි ගැන',
    'nav.contact': 'සම්බන්ධතා',
    'nav.login': 'ප්‍රවේශය',
    'nav.register': 'ලියාපදිංචිය',
    'nav.dashboard': 'උපකරණ පුවරුව',
    'nav.profile': 'පැතිකඩ',
    'nav.logout': 'පිටවීම',
    
    // Common
    'common.search': 'සොයන්න',
    'common.filter': 'පෙරහන',
    'common.sort': 'වර්ග කරන්න',
    'common.buy': 'මිලදී ගන්න',
    'common.sell': 'විකුණන්න',
    'common.bid': 'ලංසුව',
    'common.price': 'මිල',
    'common.save': 'සුරකින්න',
    'common.cancel': 'අවලංගු කරන්න',
    'common.confirm': 'තහවුරු කරන්න',
    'common.loading': 'පූරණය වෙමින්...',
    
    // Home
    'home.hero.title': 'KGF - ඒකාබද්ධ රන් වෙළඳපොළ',
    'home.hero.subtitle': 'රන් වෙළඳාම, ඩිජිටල් ආයෝජන සහ AR අත්හදා බැලීම සමඟ ප්‍රිමියම් ආභරණ',
    'home.hero.cta': 'වෙළඳාම ආරම්භ කරන්න',
    'home.features.title': 'KGF තෝරා ගන්නේ ඇයි?',
    'home.features.verified': 'සත්‍යාපිත විකුණුම්කරුවන්',
    'home.features.ar': 'AR අත්හදා බැලීම',
    'home.features.realtime': 'සජීව වෙන්දේසි',
    'home.features.digital': 'ඩිජිටල් රන් ආයෝජන',
    
    // Products
    'products.title': 'රන් භණ්ඩ',
    'products.category.rings': 'වළලු',
    'products.category.necklaces': 'හාරය',
    'products.category.earrings': 'කරාබු',
    'products.category.bracelets': 'වළලු',
    'products.tryar': 'AR සමඟ අත්හදා බලන්න',
    
    // Auctions
    'auctions.title': 'සජීව වෙන්දේසි',
    'auctions.ending': 'ඉක්මනින් අවසන්',
    'auctions.bid.current': 'වත්මන් ලංසුව',
    'auctions.bid.place': 'ලංසුව තබන්න',
    'auctions.time.left': 'ඉතිරි කාලය',
    
    // Dashboard
    'dashboard.welcome': 'ආයුබෝවන්',
    'dashboard.overview': 'සාරාංශය',
    'dashboard.orders': 'ඇණවුම්',
    'dashboard.sales': 'විකුණුම්',
    'dashboard.bids': 'ලංසු',
    'dashboard.portfolio': 'කළඹ',
    'dashboard.analytics': 'විශ්ලේෂණ',
    'dashboard.users': 'පරිශීලකයින්',
    'dashboard.approvals': 'අනුමැතිය',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('kgf-theme');
    if (savedTheme) {
      const themeValue = savedTheme as 'light' | 'dark';
      setTheme(themeValue);
      // Sync with Redux store on initialization
      store.dispatch(setReduxTheme(themeValue));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      store.dispatch(setReduxTheme('dark'));
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('kgf-theme', theme);
  }, [theme]);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('kgf-language');
    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('kgf-language', language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Sync with Redux store (for price predictor page)
      store.dispatch(setReduxTheme(newTheme));
      return newTheme;
    });
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  }, [language]);

  const login = useCallback((email: string, _password: string) => {
    // Mock login - in real app this would call an API
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      role: 'buyer',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    };
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, role };
      }
      return null;
    });
  }, []);

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const value: AppContextType = useMemo(() => ({
    theme,
    toggleTheme,
    language,
    setLanguage: setLanguageCallback,
    t,
    user,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  }), [theme, toggleTheme, language, setLanguageCallback, t, user, login, logout, switchRole]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};