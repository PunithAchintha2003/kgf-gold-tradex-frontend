import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../../contexts/CartContext';

/**
 * Handles return from Stripe Checkout (?checkout=success|cancelled on /products).
 */
export const CheckoutReturnListener: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, closeCart } = useCart();
  const handledSignatures = useRef(new Set<string>());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    const sessionId = params.get('session_id') || '';
    const signature = `${location.pathname}:${checkout}:${sessionId}`;
    if (handledSignatures.current.has(signature)) return;
    handledSignatures.current.add(signature);

    const stripParams = () => {
      const next = new URLSearchParams(location.search);
      next.delete('checkout');
      next.delete('session_id');
      const qs = next.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
    };

    if (checkout === 'cancelled') {
      closeCart();
      toast.error('Payment unsuccessful', {
        description: 'Checkout was cancelled. You can try again when you are ready.',
      });
      stripParams();
      return;
    }

    if (checkout !== 'success') {
      stripParams();
      return;
    }

    if (!sessionId) {
      closeCart();
      toast.error('Payment unsuccessful', {
        description: 'We could not verify this session. If you were charged, please contact support.',
      });
      stripParams();
      return;
    }

    const verifyKey = `kgf_cart_checkout_ok_${sessionId}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(verifyKey)) {
      stripParams();
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Payment pending verification', {
        description: 'Sign in with the same account you used for checkout to confirm your payment.',
      });
      stripParams();
      return;
    }

    void (async () => {
      try {
        const res = await fetch(
          `/api/v1/checkout/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = (await res.json()) as {
          success?: boolean;
          data?: { paid?: boolean };
          error?: string;
        };
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Verification failed (${res.status})`);
        }
        if (!json.data?.paid) {
          closeCart();
          toast.error('Payment unsuccessful', {
            description: 'Payment was not completed. Your cart is unchanged.',
          });
          stripParams();
          return;
        }
        sessionStorage.setItem(verifyKey, '1');
        clearCart();
        closeCart();
        toast.success('Payment successful', {
          description: 'Thank you for your purchase.',
        });
      } catch (e) {
        closeCart();
        toast.error('Payment unsuccessful', {
          description: e instanceof Error ? e.message : 'Could not confirm payment.',
        });
      } finally {
        stripParams();
      }
    })();
  }, [location.search, location.pathname, navigate, clearCart, closeCart]);

  return null;
};
