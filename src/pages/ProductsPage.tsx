import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { Search, Filter, Star, Shield, Smartphone, Heart, ShoppingCart, Package } from 'lucide-react';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Product } from '../types';
import { cn } from '../components/ui/utils';
import { ProductDetailModal } from '../components/products/ProductDetailModal';
import { getNodeApiV1Base } from '@/utils/env';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onTryAR: (product: Product) => void;
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
  merchant?: ApiMerchant | null;
  createdAt?: string;
};

interface CatalogCard {
  id: string;
  name: string;
  price: number;
  currency: string;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  seller: string;
  merchantId: string;
  category: Product['category'];
  isVerified: boolean;
  isOnSale: boolean;
  arAvailable: boolean;
  purity: string;
  weight: string;
  createdAtMs: number;
  description: string;
}

function mapCategoryTitleToSlug(title: string | undefined): Product['category'] {
  const map: Record<string, Product['category']> = {
    Rings: 'rings',
    Necklaces: 'necklaces',
    Earrings: 'earrings',
    Bracelets: 'bracelets',
    Pendants: 'pendants',
    Biscuits: 'biscuits',
    Coins: 'coins',
    Bars: 'bars',
  };
  return map[title || ''] ?? 'other';
}

function mapApiProductToCard(p: ApiPublishedProduct): CatalogCard {
  const imgs = [...(p.images || [])].filter(Boolean);
  const image = imgs[0] || p.imageUrl || PLACEHOLDER_IMAGE;
  const createdAtMs = p.createdAt ? Date.parse(p.createdAt) : 0;
  const m = p.merchant;
  let merchantId = '';
  let seller = 'Merchant';
  let isVerified = false;
  if (typeof m === 'string') {
    merchantId = m;
  } else if (m && typeof m === 'object') {
    if (m._id) merchantId = String(m._id);
    if (m.name) seller = m.name;
    isVerified = Boolean(m.merchantVerified);
  }

  return {
    id: p._id,
    name: p.title,
    price: p.price,
    currency: (p.currency || 'LKR').toUpperCase(),
    image,
    rating: 5,
    reviews: 0,
    seller,
    merchantId,
    category: mapCategoryTitleToSlug(p.category),
    isVerified,
    isOnSale: false,
    // Show AR for any listed product: preview uses the same image passed to the try-on modal.
    arAvailable: true,
    purity: '—',
    weight: typeof p.stock === 'number' && p.stock >= 0 ? `Stock: ${p.stock}` : '—',
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
    description: p.description || '',
  };
}

function toProductForAR(card: CatalogCard): Product {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
    price: card.price,
    currency: card.currency === 'USD' ? 'USD' : 'LKR',
    category: card.category,
    images: [card.image],
    karat: 18,
    weight: 0,
    seller: {
      id: card.merchantId || 'merchant',
      name: card.seller,
      verified: card.isVerified,
      rating: card.rating,
    },
    inStock: true,
    featured: card.isOnSale,
  };
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate: _onNavigate, onTryAR }) => {
  const { t } = useApp();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [products, setProducts] = useState<CatalogCard[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'rings', label: t('products.category.rings') },
    { value: 'necklaces', label: t('products.category.necklaces') },
    { value: 'earrings', label: t('products.category.earrings') },
    { value: 'bracelets', label: t('products.category.bracelets') },
    { value: 'pendants', label: t('products.category.pendants') },
    { value: 'biscuits', label: t('products.category.biscuits') },
    { value: 'coins', label: t('products.category.coins') },
    { value: 'bars', label: t('products.category.bars') },
  ];

  useEffect(() => {
    const id = searchParams.get('product')?.trim();
    if (id && /^[a-f\d]{24}$/i.test(id)) {
      setDetailProductId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const res = await fetch(`${getNodeApiV1Base()}/catalog/products?limit=100`);
        const json = (await res.json()) as {
          success?: boolean;
          data?: { products?: ApiPublishedProduct[] };
          error?: string;
        };
        if (!res.ok || !json.success || !json.data?.products) {
          throw new Error(json.error || `Could not load products (${res.status})`);
        }
        if (!cancelled) {
          setProducts(json.data.products.map(mapApiProductToCard));
        }
      } catch (e) {
        if (!cancelled) {
          setCatalogError(e instanceof Error ? e.message : 'Failed to load products');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        return b.createdAtMs - a.createdAtMs;
      default:
        return 0;
    }
  });

  const formatPrice = (currency: string, price: number) => {
    return `${currency} ${price.toLocaleString()}`;
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

        {catalogError && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {catalogError}
          </div>
        )}

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
            {catalogLoading && products.length === 0
              ? 'Loading catalog…'
              : `Showing ${sortedProducts.length} of ${products.length} products`}
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        {catalogLoading && products.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Loading products…</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              tabIndex={0}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                setDetailProductId(product.id);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if ((e.target as HTMLElement).closest('button')) return;
                e.preventDefault();
                setDetailProductId(product.id);
              }}
              className={cn(
                'overflow-hidden transition-shadow hover:shadow-lg group',
                'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
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
                          onClick={(e) => {
                            e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onTryAR(toProductForAR(product));
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
                      {formatPrice(product.currency, product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.currency, product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <TooltipProvider>
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 kgf-gradient text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            id: product.id,
                            name: product.name,
                            priceLkr: product.price,
                            image: product.image,
                            seller: product.seller,
                            purity: product.purity,
                            weight: product.weight,
                            quantity: 1,
                            ...(product.merchantId ? { merchantId: product.merchantId } : {}),
                          });
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onTryAR(toProductForAR(product));
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
        )}

        {/* No Results */}
        {!catalogLoading && sortedProducts.length === 0 && (
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

      <ProductDetailModal
        productId={detailProductId}
        open={detailProductId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDetailProductId(null);
            if (searchParams.get('product')) {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('product');
              setSearchParams(nextParams, { replace: true });
            }
          }
        }}
        onTryAR={onTryAR}
        onAddToCart={(payload) => {
          addItem({ ...payload, quantity: 1 });
        }}
      />
    </div>
  );
};