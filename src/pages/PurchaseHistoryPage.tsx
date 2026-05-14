import React, { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Package, Search, RefreshCw } from 'lucide-react';
import { ROUTES } from '../core/config/routes.config';
import { ImageWithFallback } from '../shared/components/figma/ImageWithFallback';
import { cn } from '../components/ui/utils';
import { useTheme } from '../hooks/useTheme';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop';

type DeliveryStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type PopulatedProduct = {
  _id?: string;
  title?: string;
  images?: string[];
  imageUrl?: string;
};

type OrderLine = {
  _id?: string;
  name: string;
  unitPriceLkr: number;
  quantity: number;
  deliveryStatus?: DeliveryStatus;
  imageUrl?: string;
  product?: string | PopulatedProduct | null;
};

type PurchaseOrderRow = {
  _id: string;
  amountTotalLkr: number;
  currency?: string;
  items: OrderLine[];
  createdAt: string;
  paymentStatus?: string;
};

interface PurchaseHistoryPageProps {
  onNavigate: (path: string) => void;
}

function shortOrderRef(id: string) {
  return id.slice(-8).toUpperCase();
}

function resolveLineImage(line: OrderLine): string | undefined {
  if (line.imageUrl && /^https?:\/\//i.test(line.imageUrl)) {
    return line.imageUrl;
  }
  const p = line.product;
  if (p && typeof p === 'object') {
    const imgs = [...(p.images || [])].filter(Boolean);
    if (imgs.length) return imgs[0];
    if (p.imageUrl && /^https?:\/\//i.test(p.imageUrl)) return p.imageUrl;
  }
  return undefined;
}

function normalizeDeliveryStatus(raw: unknown): DeliveryStatus {
  if (typeof raw !== 'string') return 'pending';
  const s = raw.trim().toLowerCase();
  if (s === 'delivered' || s === 'processing' || s === 'shipped' || s === 'cancelled' || s === 'pending') {
    return s;
  }
  return 'pending';
}

/**
 * Same palette as Trade page `getWalletTransactionStatusChipSx` — inline so colors always
 * render (Tailwind arbitrary `bg-[#…]` classes are not guaranteed in this project’s CSS build).
 */
function deliveryChipStyle(status: DeliveryStatus, isDark: boolean): CSSProperties {
  const pad: CSSProperties = {
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '0.45rem',
    paddingBottom: '0.45rem',
    minHeight: '1.75rem',
  };
  switch (status) {
    case 'delivered':
      return isDark
        ? {
            ...pad,
            backgroundColor: 'rgba(16, 185, 129, 0.28)',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.55)',
          }
        : {
            ...pad,
            backgroundColor: '#d1fae5',
            color: '#065f46',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          };
    case 'shipped':
      return isDark
        ? {
            ...pad,
            backgroundColor: 'rgba(59, 130, 246, 0.28)',
            color: '#93c5fd',
            border: '1px solid rgba(147, 197, 253, 0.5)',
          }
        : {
            ...pad,
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid rgba(37, 99, 235, 0.35)',
          };
    case 'processing':
      return isDark
        ? {
            ...pad,
            backgroundColor: 'rgba(139, 92, 246, 0.28)',
            color: '#c4b5fd',
            border: '1px solid rgba(196, 181, 253, 0.5)',
          }
        : {
            ...pad,
            backgroundColor: '#ede9fe',
            color: '#5b21b6',
            border: '1px solid rgba(109, 40, 217, 0.35)',
          };
    case 'cancelled':
      return isDark
        ? {
            ...pad,
            backgroundColor: 'rgba(239, 68, 68, 0.28)',
            color: '#fca5a5',
            border: '1px solid rgba(252, 165, 165, 0.5)',
          }
        : {
            ...pad,
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid rgba(220, 38, 38, 0.35)',
          };
    case 'pending':
    default:
      return isDark
        ? {
            ...pad,
            backgroundColor: 'rgba(245, 158, 11, 0.28)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.55)',
          }
        : {
            ...pad,
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid rgba(217, 119, 6, 0.4)',
          };
  }
}

const deliveryChipClassName =
  'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold capitalize leading-snug tracking-wide sm:text-[13px]';

function deliveryLabel(status: DeliveryStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function orderMatchesSearch(order: PurchaseOrderRow, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const ref = shortOrderRef(order._id).toLowerCase();
  if (order._id.toLowerCase().includes(s) || ref.includes(s)) return true;
  const placed = new Date(order.createdAt).toLocaleDateString().toLowerCase();
  if (placed.includes(s)) return true;
  return (order.items || []).some((line) => line.name.toLowerCase().includes(s));
}

type SortOption = 'newest' | 'oldest' | 'total-high' | 'total-low';

function sortOrders(list: PurchaseOrderRow[], sortBy: SortOption): PurchaseOrderRow[] {
  const next = [...list];
  switch (sortBy) {
    case 'oldest':
      return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'total-high':
      return next.sort((a, b) => b.amountTotalLkr - a.amountTotalLkr);
    case 'total-low':
      return next.sort((a, b) => a.amountTotalLkr - b.amountTotalLkr);
    case 'newest':
    default:
      return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const PurchaseHistoryPage: React.FC<PurchaseHistoryPageProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const formatLkr = useCallback((n: number) => {
    return `LKR ${Math.round(n).toLocaleString('en-LK')}`;
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not signed in');
      }
      const res = await fetch('/api/v1/checkout/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { orders?: PurchaseOrderRow[] };
        error?: string;
      };
      if (!res.ok || !json.success || !json.data?.orders) {
        throw new Error(json.error || `Could not load history (${res.status})`);
      }
      setOrders(json.data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredSortedOrders = useMemo(() => {
    const filtered = orders.filter((o) => orderMatchesSearch(o, searchQuery));
    return sortOrders(filtered, sortBy);
  }, [orders, searchQuery, sortBy]);

  const tableRows = useMemo(() => {
    type Row = {
      key: string;
      orderRef: string;
      dateTimeLabel: string;
      line: OrderLine;
      quantity: number;
      lineTotalLkr: number;
    };
    const rows: Row[] = [];
    for (const order of filteredSortedOrders) {
      const placed = new Date(order.createdAt);
      const dateStr = placed.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeStr = placed.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
      const dateTimeLabel = `${dateStr} · ${timeStr}`;
      const ref = shortOrderRef(order._id);
      const items = order.items || [];
      items.forEach((line, idx) => {
        rows.push({
          key: line._id ? String(line._id) : `${order._id}-${idx}`,
          orderRef: ref,
          dateTimeLabel,
          line,
          quantity: line.quantity,
          lineTotalLkr: line.unitPriceLkr * line.quantity,
        });
      });
    }
    return rows;
  }, [filteredSortedOrders]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Purchase history</h1>
          <p className="text-muted-foreground">
            View past purchases in a compact table: product, order reference, date, quantity, delivery
            status, and line price.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-2 border-destructive/40"
              onClick={() => void loadOrders()}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search orders by product, order ref, or date…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="md:col-span-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="total-high">Total: high to low</SelectItem>
                <SelectItem value="total-low">Total: low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground">
            {loading && orders.length === 0
              ? 'Loading your orders…'
              : `Showing ${tableRows.length} line${tableRows.length === 1 ? '' : 's'} from ${filteredSortedOrders.length} of ${orders.length} orders`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2"
            onClick={() => void loadOrders()}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            Refresh
          </Button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="mb-2 inline h-8 w-8 animate-spin" aria-hidden />
            <p>Loading your orders…</p>
          </div>
        ) : (
          <>
            {filteredSortedOrders.length > 0 ? (
              <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[200px] text-center">Product</TableHead>
                      <TableHead className="text-center">Order ID</TableHead>
                      <TableHead className="min-w-[180px] whitespace-normal text-center">Date and time</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="min-w-[140px] whitespace-normal text-center">Status</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map((row) => {
                      const thumb = resolveLineImage(row.line) || PLACEHOLDER_IMAGE;
                      const delivery = normalizeDeliveryStatus(row.line.deliveryStatus);
                      return (
                        <TableRow key={row.key}>
                          <TableCell className="max-w-[280px] text-center">
                            <div className="mx-auto flex w-fit max-w-full items-center justify-center gap-3 py-1">
                              <div
                                className={cn(
                                  'relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted',
                                  'sm:h-14 sm:w-14',
                                )}
                              >
                                <ImageWithFallback
                                  src={thumb}
                                  alt={row.line.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="min-w-0 font-medium leading-snug text-foreground whitespace-normal">
                                {row.line.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground sm:text-sm">
                            {row.orderRef}
                          </TableCell>
                          <TableCell className="whitespace-normal text-center text-muted-foreground">
                            {row.dateTimeLabel}
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-foreground">{row.quantity}</TableCell>
                          <TableCell className="whitespace-normal text-center">
                            <span
                              className={deliveryChipClassName}
                              style={deliveryChipStyle(delivery, isDark)}
                              role="status"
                              aria-label={`Delivery: ${deliveryLabel(delivery)}`}
                            >
                              {deliveryLabel(delivery)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold tabular-nums text-foreground sm:text-base">
                            {formatLkr(row.lineTotalLkr)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </>
        )}

        {!loading && orders.length > 0 && filteredSortedOrders.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-12 w-12 text-muted-foreground" aria-hidden />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No orders match your search</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Try a different product name, order reference, or clear the search to see all orders.
            </p>
            <Button type="button" variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-12 w-12 text-muted-foreground" aria-hidden />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              When you complete a checkout, your orders and delivery status will appear here.
            </p>
            <Button type="button" onClick={() => onNavigate(ROUTES.PRODUCTS)}>
              Browse products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
