import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useApp } from '../contexts/AppContext';
import { Search, Filter, Star, Shield, Smartphone, Heart, ShoppingCart, Package } from 'lucide-react';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Product } from '../types';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onTryAR: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate: _onNavigate, onTryAR }) => {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'rings', label: t('products.category.rings') },
    { value: 'necklaces', label: t('products.category.necklaces') },
    { value: 'earrings', label: t('products.category.earrings') },
    { value: 'bracelets', label: t('products.category.bracelets') },
  ];

  const products = [
    {
      id: 1,
      name: 'Royal Crown Ring',
      price: 125000,
      originalPrice: 150000,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews: 124,
      seller: 'Golden Palace',
      category: 'rings',
      isVerified: true,
      isOnSale: true,
      arAvailable: true,
      purity: '22K',
      weight: '8.5g'
    },
    {
      id: 2,
      name: 'Heritage Necklace',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 89,
      seller: 'Royal Jewelers',
      category: 'necklaces',
      isVerified: true,
      isOnSale: false,
      arAvailable: true,
      purity: '18K',
      weight: '12.3g'
    },
    {
      id: 3,
      name: 'Diamond Earrings',
      price: 65000,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 156,
      seller: 'Gem Palace',
      category: 'earrings',
      isVerified: true,
      isOnSale: false,
      arAvailable: true,
      purity: '18K',
      weight: '6.2g'
    },
    {
      id: 4,
      name: 'Traditional Kada',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 78,
      seller: 'Heritage Gold',
      category: 'bracelets',
      isVerified: true,
      isOnSale: false,
      arAvailable: false,
      purity: '22K',
      weight: '25.4g'
    },
    {
      id: 5,
      name: 'Elegant Chain',
      price: 45000,
      originalPrice: 55000,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 92,
      seller: 'Modern Gold',
      category: 'necklaces',
      isVerified: true,
      isOnSale: true,
      arAvailable: true,
      purity: '18K',
      weight: '8.9g'
    },
    {
      id: 6,
      name: 'Designer Ring Set',
      price: 175000,
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews: 203,
      seller: 'Luxury Gems',
      category: 'rings',
      isVerified: true,
      isOnSale: false,
      arAvailable: true,
      purity: '22K',
      weight: '15.7g'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under50k' && product.price < 50000) ||
      (priceRange === '50k-100k' && product.price >= 50000 && product.price <= 100000) ||
      (priceRange === 'over100k' && product.price > 100000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('products.title')}</h1>
          <p className="text-muted-foreground">
            Discover premium gold jewelry from verified sellers
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under50k">Under LKR 50,000</SelectItem>
              <SelectItem value="50k-100k">LKR 50,000 - 100,000</SelectItem>
              <SelectItem value="over100k">Over LKR 100,000</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {sortedProducts.length} of {products.length} products
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-square overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  {product.isOnSale && (
                    <Badge className="bg-red-500 text-white">Sale</Badge>
                  )}
                  {product.isVerified && (
                    <Badge className="bg-green-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <TooltipProvider>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="w-10 h-10 p-0"
                          onClick={() => {
                            toast.success('Added to wishlist', {
                              description: `${product.name} has been saved to your wishlist.`,
                            });
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to wishlist</p>
                      </TooltipContent>
                    </Tooltip>
                    {product.arAvailable && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="w-10 h-10 p-0"
                            onClick={() => {
                              // Convert mock product to Product type
                              const productForAR: Product = {
                                id: product.id.toString(),
                                name: product.name,
                                description: '',
                                price: product.price,
                                currency: 'LKR',
                                category: product.category as Product['category'],
                                images: [product.image],
                                karat: parseInt(product.purity) || 18,
                                weight: parseFloat(product.weight) || 0,
                                seller: {
                                  id: '1',
                                  name: product.seller,
                                  verified: product.isVerified,
                                  rating: product.rating,
                                },
                                inStock: true,
                                featured: product.isOnSale,
                              };
                              onTryAR(productForAR);
                            }}
                          >
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Try with AR</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.seller}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>

                  {/* Specifications */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{product.purity}</span>
                    <span>{product.weight}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <TooltipProvider>
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 kgf-gradient text-white"
                        onClick={() => {
                          toast.success('Added to cart', {
                            description: `${product.name} has been added to your shopping cart.`,
                          });
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      {product.arAvailable && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Convert mock product to Product type
                                const productForAR: Product = {
                                  id: product.id.toString(),
                                  name: product.name,
                                  description: '',
                                  price: product.price,
                                  currency: 'LKR',
                                  category: product.category as Product['category'],
                                  images: [product.image],
                                  karat: parseInt(product.purity) || 18,
                                  weight: parseFloat(product.weight) || 0,
                                  seller: {
                                    id: '1',
                                    name: product.seller,
                                    verified: product.isVerified,
                                    rating: product.rating,
                                  },
                                  inStock: true,
                                  featured: product.isOnSale,
                                };
                                onTryAR(productForAR);
                              }}
                            >
                              <Smartphone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Try on with AR</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {sortedProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any products matching your search criteria. Try adjusting your filters or browse all categories.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setSortBy('featured');
                  toast.info('Filters cleared', {
                    description: 'All filters have been reset.',
                  });
                }}
              >
                Clear All Filters
              </Button>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange('all');
                setSortBy('featured');
              }}>
                Browse All Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};