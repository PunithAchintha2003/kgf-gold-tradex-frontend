import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../../shared/components/figma/ImageWithFallback';
import { Star, Shield, ShoppingCart, Smartphone, Loader2, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../../types';
import { cn } from '../ui/utils';
import { getNodeApiV1Base } from '@/utils/env';

type ApiMerchant = { _id?: string; name?: string; merchantVerified?: boolean } | string | null;

export type ApiProductDetail = {
  _id: string;
  title: string;
  description?: string;
  sku?: string;
  price: number;
  currency?: string;
  category?: string;
  images?: string[];
  imageUrl?: string;
  stock?: number;
  merchant?: ApiMerchant;
};

export type ApiReview = {
  _id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewSummary = { count: number; avgRating: number | null };

const CATEGORY_TITLE_TO_PRODUCT: Record<string, Product['category']> = {
  Rings: 'rings',
  Necklaces: 'necklaces',
  Earrings: 'earrings',
  Bracelets: 'bracelets',
  Pendants: 'pendants',
  Biscuits: 'biscuits',
  Coins: 'coins',
  Bars: 'bars',
};

function merchantMeta(m: ApiMerchant | undefined) {
  if (!m || typeof m === 'string') {
    return { name: 'Merchant', verified: false, id: typeof m === 'string' ? m : '' };
  }
  return {
    name: m.name || 'Merchant',
    verified: Boolean(m.merchantVerified),
    id: m._id ? String(m._id) : '',
  };
}

function galleryImages(p: ApiProductDetail): string[] {
  const fromArr = [...(p.images || [])].filter(Boolean);
  if (fromArr.length) return fromArr;
  if (p.imageUrl) return [p.imageUrl];
  return [];
}

function toProductForAR(p: ApiProductDetail): Product {
  const imgs = galleryImages(p);
  const { name, verified, id } = merchantMeta(p.merchant);
  const image = imgs[0] || '';
  const category = CATEGORY_TITLE_TO_PRODUCT[p.category || ''] ?? 'other';
  return {
    id: p._id,
    name: p.title,
    description: p.description || '',
    price: p.price,
    currency: (p.currency || 'LKR').toUpperCase() === 'USD' ? 'USD' : 'LKR',
    category,
    images: image ? [image] : [],
    karat: 18,
    weight: 0,
    seller: { id: id || 'merchant', name, verified, rating: 5 },
    inStock: typeof p.stock === 'number' ? p.stock > 0 : true,
    featured: false,
  };
}

function formatPrice(currency: string, price: number) {
  return `${currency} ${price.toLocaleString()}`;
}

function RatingStarsInput({
  value,
  onChange,
  labelledBy,
}: {
  value: number | null;
  onChange: (n: number) => void;
  labelledBy: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-labelledby={labelledBy}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value != null && n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'rounded-md p-2 min-h-11 min-w-11 flex items-center justify-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              active ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-400',
            )}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={value != null && n <= value}
          >
            <Star className={cn('h-7 w-7', active && 'fill-current')} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

function RatingReadOnly({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-4 w-4',
            n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export interface ProductDetailModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTryAR: (product: Product) => void;
  onAddToCart: (payload: {
    id: string;
    name: string;
    priceLkr: number;
    image: string;
    seller: string;
    purity: string;
    weight: string;
    merchantId?: string;
  }) => void;
}

export function ProductDetailModal({
  productId,
  open,
  onOpenChange,
  onTryAR,
  onAddToCart,
}: ProductDetailModalProps) {
  const authorInputId = useId();
  const ratingLegendId = useId();
  const commentId = useId();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, avgRating: null });
  const [activeImage, setActiveImage] = useState(0);

  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${getNodeApiV1Base()}/catalog/products/${productId}`);
      const json = (await res.json()) as {
        success?: boolean;
        data?: { product: ApiProductDetail; reviews: ApiReview[]; reviewSummary: ReviewSummary };
        error?: string;
      };
      if (!res.ok || !json.success || !json.data?.product) {
        throw new Error(json.error || `Could not load product (${res.status})`);
      }
      setProduct(json.data.product);
      setReviews(json.data.reviews || []);
      setSummary(json.data.reviewSummary || { count: 0, avgRating: null });
      setActiveImage(0);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
      setProduct(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!open || !productId) return;
    void loadDetail();
  }, [open, productId, loadDetail]);

  useEffect(() => {
    if (!open) {
      setAuthorName('');
      setRating(null);
      setComment('');
      setLoadError(null);
    }
  }, [open]);

  const imgs = product ? galleryImages(product) : [];
  const mainSrc = imgs[activeImage] || imgs[0] || '';
  const currency = (product?.currency || 'LKR').toUpperCase();
  const { name: sellerName, verified } = merchantMeta(product?.merchant);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || rating == null) {
      toast.error('Please choose a star rating', { description: 'Ratings help other buyers decide.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getNodeApiV1Base()}/catalog/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || undefined,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { review: ApiReview; reviewSummary: ReviewSummary };
        error?: string;
        errors?: { message: string }[];
      };
      if (!res.ok || !json.success || !json.data?.review) {
        const msg =
          json.errors?.map((x) => x.message).join(' ') || json.error || 'Could not submit review';
        throw new Error(msg);
      }
      setReviews((prev) => [json.data!.review, ...prev]);
      setSummary(json.data.reviewSummary);
      setComment('');
      setRating(null);
      toast.success('Review posted', { description: 'Thank you for sharing your feedback.' });
    } catch (err) {
      toast.error('Review not saved', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !mainSrc) return;
    const { id: merchantId } = merchantMeta(product.merchant);
    onAddToCart({
      id: product._id,
      name: product.title,
      priceLkr: product.price,
      image: mainSrc,
      seller: sellerName,
      purity: '—',
      weight: typeof product.stock === 'number' ? `Stock: ${product.stock}` : '—',
      ...(merchantId ? { merchantId } : {}),
    });
    toast.success('Added to cart', { description: `${product.title} is in your cart.` });
  };

  const dialogTitle = loading ? 'Loading product' : product?.title ?? 'Product details';
  const dialogDescription = loading
    ? 'Please wait while we load images, price, and reviews.'
    : product
      ? 'Images, price, description, and customer reviews for this listing.'
      : loadError
        ? 'The product could not be loaded.'
        : 'Product information.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 p-0 overflow-hidden rounded-md border shadow-2xl',
          'w-[min(100vw-1.25rem,56rem)] max-w-[min(100vw-1.25rem,56rem)] sm:max-w-[min(100vw-1.25rem,56rem)]',
          'max-h-[min(92vh,48rem)] flex flex-col',
          'translate-x-[-50%] translate-y-[-50%]',
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold leading-snug md:text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{dialogDescription}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
            <p className="text-sm">Loading product…</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="p-8 text-center">
            <p className="text-destructive text-sm font-medium">{loadError}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => void loadDetail()}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !loadError && product && (
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
            <div className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain border-b border-border bg-muted/30 md:border-b-0 md:border-r">
              <div className="shrink-0">
                <div className="relative aspect-square w-full bg-muted">
                  {mainSrc ? (
                    <ImageWithFallback
                      src={mainSrc}
                      alt={product.title}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                {imgs.length > 1 && (
                  <div
                    className="flex gap-2 overflow-x-auto p-3"
                    role="tablist"
                    aria-label="Product images"
                  >
                    {imgs.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        role="tab"
                        aria-selected={i === activeImage}
                        onClick={() => setActiveImage(i)}
                        className={cn(
                          'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          i === activeImage ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30',
                        )}
                      >
                        <ImageWithFallback src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6 p-6 md:p-8">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {product.category && (
                      <Badge variant="secondary" className="font-normal">
                        {product.category}
                      </Badge>
                    )}
                    {verified && (
                      <Badge className="bg-emerald-600 font-normal text-white hover:bg-emerald-600">
                        <Shield className="mr-1 h-3 w-3" aria-hidden />
                        Verified seller
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Sold by {sellerName}</p>
                  {summary.count > 0 && summary.avgRating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <RatingReadOnly rating={summary.avgRating} />
                      <span className="font-medium tabular-nums">{summary.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({summary.count} review{summary.count === 1 ? '' : 's'})
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-2xl font-bold tabular-nums text-primary">
                  {formatPrice(currency, product.price)}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" className="kgf-gradient text-white" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
                    Add to cart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onTryAR(toProductForAR(product));
                      onOpenChange(false);
                    }}
                  >
                    <Smartphone className="mr-2 h-4 w-4" aria-hidden />
                    Try with AR
                  </Button>
                </div>

                {typeof product.stock === 'number' && (
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <dt className="text-muted-foreground">Stock</dt>
                    <dd className="tabular-nums text-foreground">{product.stock}</dd>
                  </dl>
                )}

                {product.description ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Description</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain" tabIndex={-1}>
              <div className="space-y-5 p-6 md:p-8">
                <section className="space-y-4" aria-labelledby="reviews-heading">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="h-5 w-5 text-muted-foreground" aria-hidden />
                    <h3 id="reviews-heading" className="text-base font-semibold">
                      Reviews
                    </h3>
                  </div>

                  <form
                    onSubmit={handleSubmitReview}
                    className="space-y-4 rounded-lg border border-border bg-card p-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Share your experience. Your review is public.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor={authorInputId}>Display name (optional)</Label>
                      <Input
                        id={authorInputId}
                        autoComplete="nickname"
                        maxLength={80}
                        placeholder="e.g. Alex"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <p id={ratingLegendId} className="text-sm font-medium">
                        Overall rating <span className="text-destructive">*</span>
                      </p>
                      <RatingStarsInput value={rating} onChange={setRating} labelledBy={ratingLegendId} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={commentId}>Written review (optional)</Label>
                      <Textarea
                        id={commentId}
                        rows={4}
                        maxLength={2000}
                        placeholder="Quality, packaging, delivery…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px] resize-y"
                      />
                      <p className="text-xs text-muted-foreground text-right tabular-nums">
                        {comment.length} / 2000
                      </p>
                    </div>
                    <Button type="submit" disabled={submitting || rating == null} className="min-h-11 w-full sm:w-auto">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Submitting…
                        </>
                      ) : (
                        'Submit review'
                      )}
                    </Button>
                  </form>

                  <div className="space-y-3">
                    {reviews.length === 0 ? (
                      <p className="py-2 text-sm text-muted-foreground">No reviews yet. Be the first.</p>
                    ) : (
                      <ul className="space-y-3">
                        {reviews.map((r) => (
                          <li
                            key={r._id}
                            className="rounded-lg border border-border bg-background px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium text-foreground">{r.authorName}</span>
                              <time
                                className="text-xs text-muted-foreground tabular-nums"
                                dateTime={r.createdAt}
                              >
                                {new Date(r.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </time>
                            </div>
                            <div className="mt-1">
                              <RatingReadOnly rating={r.rating} />
                            </div>
                            {r.comment ? (
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
