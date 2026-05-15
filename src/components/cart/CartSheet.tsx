import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Add, Remove, DeleteOutline } from '@mui/icons-material';
import { toast } from 'sonner';
import Sidebar from '../price-predictor/Sidebar';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../contexts/AppContext';
import { useCart } from '../../contexts/CartContext';
import { ROUTES } from '../../core/config/routes.config';
import { ImageWithFallback } from '../../shared/components/figma/ImageWithFallback';
import { getNodeApiV1Base } from '@/utils/env';

export const CartSheet: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useApp();
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotalLkr,
  } = useCart();

  const formatLkr = useCallback((n: number) => {
    return `LKR ${Math.round(n).toLocaleString('en-LK')}`;
  }, []);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated || items.length === 0) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Session expired', { description: 'Please sign in again to checkout.' });
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${getNodeApiV1Base()}/checkout/cart-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.name,
            priceLkr: Math.round(i.priceLkr),
            quantity: i.quantity,
            productId: i.id,
            imageUrl: i.image,
            ...(i.merchantId ? { merchantId: i.merchantId } : {}),
          })),
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { url?: string };
        error?: string;
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(json.error || 'Could not start checkout');
      }
      toast.success('Redirecting to secure payment…');
      window.location.assign(json.data.url);
    } catch (e) {
      toast.error('Checkout failed', {
        description: e instanceof Error ? e.message : 'Please try again.',
      });
      setCheckoutLoading(false);
    }
  }, [isAuthenticated, items]);

  const goLogin = useCallback(() => {
    closeCart();
    navigate(ROUTES.LOGIN);
  }, [closeCart, navigate]);

  const muted = isDark ? '#9ca3af' : '#6b7280';
  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f9fafb';

  const primaryButtonSx = {
    backgroundColor: '#10b981',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#059669',
      boxShadow: isDark
        ? '0 4px 12px rgba(16, 185, 129, 0.4)'
        : '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    paddingY: 1.5,
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none' as const,
  };

  const footer =
    items.length > 0 ? (
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body2"
            sx={{ color: muted, fontSize: '0.875rem' }}
          >
            Subtotal
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: isDark ? '#FFFFFF' : '#111827',
              fontWeight: 700,
              fontSize: '1.125rem',
            }}
          >
            {formatLkr(subtotalLkr)}
          </Typography>
        </Stack>
        <Divider sx={{ borderColor: border }} />
        {!isAuthenticated ? (
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: muted, lineHeight: 1.6 }}>
              Sign in with your registered account to complete checkout.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={goLogin}
              sx={primaryButtonSx}
            >
              Sign in to checkout
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={checkoutLoading}
            onClick={() => void handleCheckout()}
            sx={primaryButtonSx}
          >
            {checkoutLoading ? (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
                <CircularProgress size={22} color="inherit" aria-hidden />
                <span>Redirecting…</span>
              </Stack>
            ) : (
              'Checkout'
            )}
          </Button>
        )}
      </Stack>
    ) : undefined;

  return (
    <Sidebar
      open={isOpen}
      onClose={closeCart}
      title="Shopping cart"
      width={400}
      footer={footer}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: muted,
            marginBottom: 3,
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
        >
          {isAuthenticated
            ? "Review your items, then use Checkout below to complete your order."
            : 'Review your items. Sign in is required to checkout.'}
        </Typography>

        {items.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              color: muted,
              textAlign: 'center',
              py: 4,
              fontSize: '0.875rem',
            }}
          >
            Your cart is empty. Add products from the shop.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((line) => (
              <Box
                key={line.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: `1px solid ${border}`,
                  backgroundColor: cardBg,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: isDark ? '#1a1a1a' : '#e5e7eb',
                  }}
                >
                  <ImageWithFallback
                    src={line.image}
                    alt={line.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: isDark ? '#FFFFFF' : '#111827',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {line.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: muted, display: 'block', mt: 0.5 }}>
                    {line.seller}
                  </Typography>
                  <Typography variant="caption" sx={{ color: muted, display: 'block' }}>
                    {line.purity} · {line.weight}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#10b981', fontWeight: 600, mt: 0.5 }}
                  >
                    {formatLkr(line.priceLkr)} each
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: muted }}>
                      Qty
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${border}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        sx={{ borderRadius: 0, color: isDark ? '#fff' : '#111' }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography
                        component="span"
                        sx={{
                          minWidth: 28,
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {line.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                        sx={{ borderRadius: 0, color: isDark ? '#fff' : '#111' }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      textAlign: 'right',
                      fontWeight: 600,
                      color: isDark ? '#e5e7eb' : '#374151',
                    }}
                  >
                    Line: {formatLkr(line.priceLkr * line.quantity)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Sidebar>
  );
};
