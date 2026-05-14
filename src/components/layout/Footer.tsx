import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    
    if (email) {
      toast.success('Subscribed!', {
        description: `You've been subscribed to our newsletter at ${email}`,
      });
      e.currentTarget.reset();
    }
  };

  return (
    <footer className="bg-muted/50 border-t" role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 kgf-text-gradient">KGF Gold TradeX</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Sri Lanka's premier digital gold marketplace. Trade gold, participate in auctions, 
              and invest in digital gold with complete transparency and security.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <span>123 Galle Road, Colombo 03, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="tel:+94112345678" className="hover:text-primary transition-colors">
                  +94 11 234 5678
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="mailto:info@kgftradex.lk" className="hover:text-primary transition-colors">
                  info@kgftradex.lk
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate('/')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/products')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/auctions')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Auctions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/about')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/contact')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate('/products')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Buy Gold Jewelry
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/auctions')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Live Auctions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/price-predictor')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Price Predictor
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/products')}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  AR Try-On
                </button>
              </li>
              <li>
                <span className="text-muted-foreground text-sm cursor-default">
                  Digital Gold Investment
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to get updates on new products and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="w-full"
                aria-label="Email address for newsletter"
              />
              <Button 
                type="submit" 
                className="w-full kgf-gradient text-white"
                aria-label="Subscribe to newsletter"
              >
                <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} KGF Gold TradeX. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit our Twitter profile"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit our Instagram profile"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => onNavigate('/privacy')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => onNavigate('/terms')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
