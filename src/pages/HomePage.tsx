import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useApp } from '../contexts/AppContext';
import { ArrowRight, Shield, Smartphone, Gavel, TrendingUp, Star, Users, Award, Clock } from 'lucide-react';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useApp();

  const features = [
    {
      icon: Shield,
      title: t('home.features.verified'),
      description: 'All gold sellers are verified and certified for your security',
      color: 'text-green-600'
    },
    {
      icon: Smartphone,
      title: t('home.features.ar'),
      description: 'Try on jewelry virtually with our advanced AR technology',
      color: 'text-blue-600'
    },
    {
      icon: Gavel,
      title: t('home.features.realtime'),
      description: 'Participate in live auctions from verified pawnshops',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: t('home.features.digital'),
      description: 'Invest in digital gold with real-time price tracking',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Verified Products', icon: Award },
    { number: '5,000+', label: 'Happy Customers', icon: Users },
    { number: '500+', label: 'Gold Sellers', icon: Shield },
    { number: '99.9%', label: 'Gold Purity', icon: Star }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Royal Crown Ring',
      price: 'LKR 125,000',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop',
      rating: 4.9,
      seller: 'Golden Palace',
      isVerified: true
    },
    {
      id: 2,
      name: 'Heritage Necklace',
      price: 'LKR 85,000',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop',
      rating: 4.8,
      seller: 'Royal Jewelers',
      isVerified: true
    },
    {
      id: 3,
      name: 'Diamond Earrings',
      price: 'LKR 65,000',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop',
      rating: 4.7,
      seller: 'Gem Palace',
      isVerified: true
    }
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 kgf-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="kgf-gradient text-white">
                  Sri Lanka's Premier Gold Marketplace
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {t('home.hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  {t('home.hero.subtitle')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="kgf-gradient text-white"
                  onClick={() => onNavigate('/products')}
                >
                  {t('home.hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onNavigate('/auctions')}
                >
                  View Live Auctions
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"
                  alt="Premium Gold Jewelry"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of gold trading with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked premium gold jewelry</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('/products')}>
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-2">{product.price}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-1 text-green-600" />
                    {product.seller}
                  </div>
                  <Button className="w-full mt-4 kgf-gradient text-white">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Live Auctions</h2>
              <p className="text-muted-foreground">Bid on premium gold items ending soon</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('/auctions')}>
              View All Auctions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {liveAuctions.map((auction) => (
              <Card key={auction.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{auction.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-2xl font-bold text-primary">{auction.currentBid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Time Left</p>
                      <p className="text-lg font-bold flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {auction.timeLeft}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {auction.bidders} bidders
                    </span>
                    <Button className="kgf-gradient text-white">
                      Place Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="kgf-gradient text-white overflow-hidden">
            <div className="relative p-12 lg:p-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Start Your Gold Journey Today
                  </h2>
                  <p className="text-xl opacity-90 mb-8">
                    Join thousands of satisfied customers who trust KGF for their gold trading needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      onClick={() => onNavigate('/register')}
                    >
                      Create Account
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-primary"
                      onClick={() => onNavigate('/about')}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white/10 backdrop-blur">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&h=500&fit=crop"
                      alt="Gold Investment"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};