import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useApp } from '../contexts/AppContext';
import { Footer } from '../components/layout/Footer';
import { 
  ArrowRight, 
  Shield, 
  Smartphone, 
  Gavel, 
  TrendingUp, 
  Star, 
  Users, 
  Award, 
  Clock,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: number;
  seller: string;
  isVerified: boolean;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop';

type ApiMerchant = {
  _id?: string;
  name?: string;
  merchantVerified?: boolean;
};

type ApiPublishedProduct = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  images?: string[];
  imageUrl?: string;
  stock?: number;
  merchant?: ApiMerchant | string | null;
  createdAt?: string;
  updatedAt?: string;
};

const JEWELRY_CATEGORY_SLUGS = ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants'] as const;

function isJewelryCategory(category: string | undefined): boolean {
  if (!category) return false;
  const c = category.trim().toLowerCase();
  return JEWELRY_CATEGORY_SLUGS.includes(c as (typeof JEWELRY_CATEGORY_SLUGS)[number]);
}

function catalogProductTimestampMs(p: ApiPublishedProduct): number {
  const u = p.updatedAt ? Date.parse(p.updatedAt) : NaN;
  if (Number.isFinite(u)) return u;
  const cr = p.createdAt ? Date.parse(p.createdAt) : NaN;
  return Number.isFinite(cr) ? cr : 0;
}

function mapCatalogProductToFeatured(p: ApiPublishedProduct): FeaturedProduct {
  const imgs = [...(p.images || [])].filter(Boolean);
  const image = imgs[0] || p.imageUrl || PLACEHOLDER_IMAGE;
  const m = p.merchant;
  let seller = 'Merchant';
  let isVerified = false;
  if (typeof m === 'string') {
    seller = 'Merchant';
  } else if (m && typeof m === 'object') {
    if (m.name) seller = m.name;
    isVerified = Boolean(m.merchantVerified);
  }
  const currency = (p.currency || 'LKR').toUpperCase();
  return {
    id: p._id,
    name: p.title,
    price: `${currency} ${Number(p.price ?? 0).toLocaleString()}`,
    image,
    rating: 5,
    seller,
    isVerified,
  };
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  // Fetch latest 3 gold jewelry products from API (same envelope as ProductsPage)
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/catalog/products?limit=100');
        const json = (await res.json()) as {
          success?: boolean;
          data?: { products?: ApiPublishedProduct[] };
          error?: string;
        };

        if (!res.ok || !json.success || !Array.isArray(json.data?.products)) {
          throw new Error(json.error || `Could not load products (${res.status})`);
        }

        const products = json.data!.products!;

        const jewelry = products.filter((p) => isJewelryCategory(p.category));
        const pool = jewelry.length > 0 ? jewelry : products;

        const latest = [...pool].sort(
          (a, b) => catalogProductTimestampMs(b) - catalogProductTimestampMs(a),
        );

        const mapped = latest.slice(0, 3).map(mapCatalogProductToFeatured);

        if (!cancelled) {
          setFeaturedProducts(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (!cancelled) {
          setFeaturedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      icon: Shield,
      title: t('home.features.verified'),
      description: 'All gold sellers are verified and certified for your security',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      ariaLabel: 'Verified sellers feature - ensuring secure transactions'
    },
    {
      icon: Smartphone,
      title: t('home.features.ar'),
      description: 'Try on jewelry virtually with our advanced AR technology',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      ariaLabel: 'Augmented reality try-on feature'
    },
    {
      icon: Gavel,
      title: t('home.features.realtime'),
      description: 'Participate in live auctions from verified pawnshops',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      ariaLabel: 'Real-time auction participation'
    },
    {
      icon: TrendingUp,
      title: t('home.features.digital'),
      description: 'Invest in digital gold with real-time price tracking',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      ariaLabel: 'Digital gold investment feature'
    }
  ];

  const trustBadges = [
    { icon: Lock, text: 'Secure Payments', subtext: 'SSL Encrypted' },
    { icon: CheckCircle2, text: '100% Authentic', subtext: 'Certified Gold' },
    { icon: Shield, text: 'Buyer Protection', subtext: 'Money-back Guarantee' },
    { icon: Award, text: 'Award Winning', subtext: 'Best Gold Platform 2026' }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Priya Perera',
      role: 'Gold Investor',
      content: 'The digital gold investment feature is fantastic! Easy to use and transparent pricing. I\'ve been investing for 6 months now.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      role: 'Jewelry Buyer',
      content: 'The AR try-on feature saved me so much time! I could see how the necklace looked before buying. Amazing technology!',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 3,
      name: 'Nimal Silva',
      role: 'Auction Participant',
      content: 'Won my first auction last week! The process was smooth and transparent. Highly recommend KGF TradeX.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    {
      id: 4,
      name: 'Anjali Fernando',
      role: 'Regular Customer',
      content: 'Best place to buy gold jewelry online! Authentic products and great customer service. Very happy with my purchases.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Verified Products', icon: Award },
    { number: '5,000+', label: 'Happy Customers', icon: Users },
    { number: '500+', label: 'Gold Sellers', icon: Shield },
    { number: '99.9%', label: 'Gold Purity', icon: Star }
  ];

  const liveAuctions = [
    {
      id: 1,
      title: 'Antique Gold Bracelet',
      currentBid: 'LKR 45,000',
      timeLeft: '2h 34m',
      image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=300&h=200&fit=crop',
      bidders: 12
    },
    {
      id: 2,
      title: 'Traditional Kada',
      currentBid: 'LKR 32,000',
      timeLeft: '1h 15m',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300&h=200&fit=crop',
      bidders: 8
    }
  ];

  return (
    <>
      <div className="min-h-screen">
        {/* Skip to main content - Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>

      {/* Hero Section - Main Value Proposition */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 kgf-gradient opacity-5" aria-hidden="true"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content - Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="kgf-gradient text-white" aria-label="Platform designation">
                  <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                  Sri Lanka's Premier Gold Marketplace
                </Badge>
                <h1 
                  id="hero-heading"
                  className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight"
                >
                  {t('home.hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  {t('home.hero.subtitle')}
                </p>
              </div>
              
              {/* Primary CTAs - Clear Hierarchy */}
              <div className="flex flex-col sm:flex-row gap-4" role="group" aria-label="Primary actions">
                <Button 
                  size="lg" 
                  className="kgf-gradient text-white hover:shadow-lg transition-shadow min-h-[44px]"
                  onClick={() => onNavigate('/products')}
                  aria-label="Start trading - Browse all gold products"
                >
                  {t('home.hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => onNavigate('/auctions')}
                  aria-label="View all live auctions"
                >
                  View Live Auctions
                </Button>
              </div>

              {/* Trust Signals - Social Proof */}
              <div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
                role="region"
                aria-label="Platform statistics"
              >
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" aria-hidden="true" />
                    <div className="text-2xl font-bold" aria-label={`${stat.number} ${stat.label}`}>
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image - Right Column */}
            <div className="relative" aria-hidden="true">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"
                  alt="Premium gold jewelry showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Live Status Indicator */}
              <div 
                className="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg backdrop-blur-sm"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <div>
                    <div className="font-medium">Live Auctions</div>
                    <div className="text-sm text-muted-foreground">24 active now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Security & Credibility */}
      <section className="py-8 border-y bg-muted/30" aria-label="Trust indicators">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div 
                key={index}
                className="flex items-center justify-center gap-3 p-4 rounded-lg hover:bg-background transition-colors"
              >
                <badge.icon className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{badge.text}</div>
                  <div className="text-xs text-muted-foreground">{badge.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Core Value Propositions */}
      <section 
        id="main-content"
        className="py-20 bg-muted/50"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              id="features-heading"
              className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight"
            >
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of gold trading with our comprehensive platform
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : (
              features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary"
                  role="article"
                  aria-label={feature.ariaLabel}
                >
                  <CardHeader>
                    <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon 
                        className={`h-8 w-8 ${feature.color}`} 
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products - Product Discovery */}
      <section 
        className="py-20"
        aria-labelledby="products-heading"
      >
        <div className="container mx-auto px-4">
          {/* Section Header with CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 
                id="products-heading"
                className="text-3xl font-bold mb-2 tracking-tight"
              >
                Featured Products
              </h2>
              <p className="text-muted-foreground">Handpicked premium gold jewelry</p>
            </div>
            <Button 
              variant="outline"
              className="min-h-[44px]"
              onClick={() => onNavigate('/products')}
              aria-label="View all products in catalog"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No published products yet. Check back soon or browse the full catalog.
              </p>
            ) : (
              featuredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary group"
                  role="article"
                  aria-label={`${product.name} - ${product.price}`}
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={product.image}
                      alt={`${product.name} - Gold jewelry from ${product.seller}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                      <div 
                        className="flex items-center gap-1 flex-shrink-0"
                        role="img"
                        aria-label={`Rating: ${product.rating} out of 5 stars`}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                    
                    <p 
                      className="text-2xl font-bold text-primary mb-3"
                      aria-label={`Price: ${product.price}`}
                    >
                      {product.price}
                    </p>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Shield className="h-4 w-4 mr-1 text-green-600" aria-hidden="true" />
                      <span>
                        {product.seller}
                        {product.isVerified && (
                          <CheckCircle2 
                            className="inline h-3 w-3 ml-1 text-green-600" 
                            aria-label="Verified seller"
                          />
                        )}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full kgf-gradient text-white hover:shadow-lg transition-shadow min-h-[44px]"
                      onClick={() =>
                        onNavigate(`/products?product=${encodeURIComponent(product.id)}`)
                      }
                      aria-label={`View details for ${product.name}`}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Live Auctions - Time-Sensitive Opportunities */}
      <section 
        className="py-20 bg-muted/50"
        aria-labelledby="auctions-heading"
      >
        <div className="container mx-auto px-4">
          {/* Section Header with CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 
                  id="auctions-heading"
                  className="text-3xl font-bold tracking-tight"
                >
                  Live Auctions
                </h2>
                <Badge variant="destructive">
                  LIVE
                </Badge>
              </div>
              <p className="text-muted-foreground">Bid on premium gold items ending soon</p>
            </div>
            <Button 
              variant="outline"
              className="min-h-[44px]"
              onClick={() => onNavigate('/auctions')}
              aria-label="View all live auctions"
            >
              View All Auctions
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Auctions Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-2/3 mb-4" />
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-12 w-1/3" />
                      <Skeleton className="h-12 w-1/3" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              liveAuctions.map((auction) => (
                <Card 
                  key={auction.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary group"
                  role="article"
                  aria-label={`${auction.title} - Current bid ${auction.currentBid}`}
                >
                  {/* Auction Image with Status Indicator */}
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <ImageWithFallback
                      src={auction.image}
                      alt={`${auction.title} - Live auction item`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full" aria-hidden="true"></div>
                      LIVE
                    </div>
                  </div>
                  
                  {/* Auction Details */}
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">{auction.title}</h3>
                    
                    {/* Bid Information */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
                        <p 
                          className="text-2xl font-bold text-primary"
                          aria-label={`Current bid amount: ${auction.currentBid}`}
                        >
                          {auction.currentBid}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Time Left</p>
                        <p 
                          className="text-lg font-bold flex items-center justify-end text-red-600"
                          aria-label={`Time remaining: ${auction.timeLeft}`}
                        >
                          <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                          {auction.timeLeft}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Row */}
                    <div className="flex items-center justify-between gap-4">
                      <span 
                        className="text-sm text-muted-foreground flex items-center gap-1"
                        aria-label={`${auction.bidders} active bidders`}
                      >
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {auction.bidders} bidders
                      </span>
                      <Button 
                        className="kgf-gradient text-white hover:shadow-lg transition-shadow min-h-[44px] flex-1"
                        onClick={() => onNavigate('/auctions')}
                        aria-label={`Place bid on ${auction.title}`}
                      >
                        <Gavel className="mr-2 h-4 w-4" aria-hidden="true" />
                        Place Bid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews - Social Proof */}
      <section 
        className="py-20"
        aria-labelledby="testimonials-heading"
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              id="testimonials-heading"
              className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight"
            >
              Customer Reviews
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about their experience
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))
            ) : (
              testimonials.map((testimonial) => (
                <Card 
                  key={testimonial.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                  role="article"
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  
                  {/* Testimonial Content */}
                  <blockquote className="text-sm mb-4 leading-relaxed text-muted-foreground">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mt-auto">
                    <img
                      src={testimonial.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

    </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </>
  );
};