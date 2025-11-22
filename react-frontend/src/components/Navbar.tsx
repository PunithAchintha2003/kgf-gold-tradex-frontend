import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, useMediaQuery, useTheme as useMuiTheme, Divider } from '@mui/material';
import { Menu, Close } from '@mui/icons-material';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import CurrencyDropdown from './CurrencyDropdown';
import type { CurrencyUnit } from './CurrencyDropdown';
// @ts-expect-error - Vite handles PNG imports, TypeScript may not recognize uppercase extension
import logoImage from '../assets/28A9A4B0-D00A-4539-82A6-89A2130B5FAF.PNG';

interface NavbarProps {
  currencyUnit: CurrencyUnit;
  onCurrencyChange: (currency: CurrencyUnit) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currencyUnit, onCurrencyChange }) => {
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: mode === 'dark' ? '#111111' : '#FFFFFF',
          borderBottom: `1px solid ${mode === 'dark' ? '#1f1f1f' : '#E0E0E0'}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: '56px', sm: '64px' },
          padding: { xs: '0 8px', sm: '0 16px' },
        }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: { xs: 1, sm: 1.5 },
              height: { xs: '28px', sm: '36px', md: '40px' },
              '& img': {
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                // Remove white/light background using mix-blend-mode
                mixBlendMode: mode === 'dark' ? 'screen' : 'multiply',
                // Additional filters for better background removal
                filter: mode === 'dark' 
                  ? 'brightness(1.1) contrast(1.1) drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))' 
                  : 'brightness(0.95) contrast(1.05)',
                imageRendering: 'auto',
                display: 'block',
                // Ensure transparent background works
                backgroundColor: 'transparent',
              },
            }}
          >
            <img
              src={logoImage}
              alt="KGF Logo"
            />
          </Box>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: mode === 'dark' ? '#FFFFFF' : '#000000',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: 'flex',
              alignItems: 'center',
            }}
          >
          
          </Typography>
          
          {/* Desktop Menu Items */}
          {!isMobile && (
            <>
              <CurrencyDropdown
                value={currencyUnit}
                onChange={onCurrencyChange}
              />
              <Box sx={{ marginLeft: { xs: 1, sm: 2 } }}>
                <ThemeToggle />
              </Box>
            </>
          )}
          
          {/* Hamburger Menu Button - Mobile Only */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                marginLeft: 1,
                color: mode === 'dark' ? '#FFFFFF' : '#000000',
              }}
            >
              <Menu />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '85%', md: 280 },
            maxWidth: { xs: '100vw', sm: '90vw', md: 280 },
            backgroundColor: mode === 'dark' ? '#111111' : '#FFFFFF',
            borderLeft: `1px solid ${mode === 'dark' ? '#1f1f1f' : '#E0E0E0'}`,
            boxShadow: mode === 'dark' 
              ? '-4px 0 20px rgba(0, 0, 0, 0.5)' 
              : '-4px 0 20px rgba(0, 0, 0, 0.1)',
          },
        }}
        transitionDuration={300}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: { xs: '1rem', sm: '1.5rem' },
              borderBottom: `1px solid ${mode === 'dark' ? '#1f1f1f' : '#E0E0E0'}`,
              minHeight: { xs: '56px', sm: '64px' },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: mode === 'dark' ? '#FFFFFF' : '#000000',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                flex: 1,
              }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: mode === 'dark' ? '#FFFFFF' : '#000000',
                padding: { xs: '8px', sm: '12px' },
                minWidth: { xs: '48px', sm: '56px' },
                minHeight: { xs: '48px', sm: '56px' },
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#1a1a1a' : '#F5F5F5',
                },
                '&:active': {
                  backgroundColor: mode === 'dark' ? '#2a2a2a' : '#E5E5E5',
                },
              }}
              aria-label="close menu"
            >
              <Close fontSize={isMobile ? 'medium' : 'large'} />
            </IconButton>
          </Box>
          
          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              padding: { xs: '1rem', sm: '1.5rem' },
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: mode === 'dark' ? '#1a1a1a' : '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'dark' ? '#444' : '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: mode === 'dark' ? '#555' : '#666',
              },
            }}
          >
            {/* Currency Dropdown */}
            <Box sx={{ marginBottom: { xs: 2, sm: 3 } }}>
              <Typography
                variant="body2"
                sx={{
                  color: mode === 'dark' ? '#cccccc' : '#666666',
                  marginBottom: 1,
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                }}
              >
                Currency
              </Typography>
              <CurrencyDropdown
                value={currencyUnit}
                onChange={(newValue) => {
                  onCurrencyChange(newValue);
                  setMobileMenuOpen(false);
                }}
              />
            </Box>
            
            <Divider sx={{ marginBottom: { xs: 2, sm: 2 } }} />
            
            {/* Theme Toggle */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: mode === 'dark' ? '#cccccc' : '#666666',
                  marginBottom: 1,
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                }}
              >
                Theme
              </Typography>
              <ThemeToggle />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

Navbar.displayName = 'Navbar';

export default Navbar;

