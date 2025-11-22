import React from 'react';
import { Drawer, Box, IconButton, Typography, useMediaQuery, useTheme as useMuiTheme, Fade, keyframes } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '../hooks/useTheme';

// Chest of drawers animation - smooth slide out
const drawerSlideIn = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
`;

const drawerSlideOut = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
`;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  children,
  title = 'Sidebar',
  width = 400,
}) => {
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          transition: 'opacity 0.4s ease-out !important',
        },
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '85%', md: width },
          maxWidth: { xs: '100vw', sm: '90vw', md: width },
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderLeft: isDark ? `1px solid #1f1f1f` : `1px solid #E0E0E0`,
          boxShadow: isDark 
            ? 'none'
            : '-4px 0 20px rgba(0, 0, 0, 0.1)',
          transition: 'none !important',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          ...(open && {
            animation: `${drawerSlideIn} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          }),
          ...(!open && {
            animation: `${drawerSlideOut} 0.3s ease-in forwards`,
          }),
          willChange: 'transform',
        },
      }}
      transitionDuration={500}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      SlideProps={{
        timeout: { enter: 500, exit: 300 },
        appear: false,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: isDark ? '#000000' : 'transparent',
        }}
      >
        {/* Header */}
        <Fade in={open} timeout={{ enter: 500, exit: 200 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: { xs: '1rem', sm: '1.5rem' },
              borderBottom: isDark ? 'none' : `1px solid #E0E0E0`,
              minHeight: { xs: '56px', sm: '64px' },
            }}
          >
          <Typography
            variant="h6"
            sx={{
              color: isDark ? '#FFFFFF' : '#000000',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              flex: 1,
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: isDark ? '#FFFFFF' : '#000000',
              padding: { xs: '8px', sm: '12px' },
              minWidth: { xs: '48px', sm: '56px' },
              minHeight: { xs: '48px', sm: '56px' },
              '&:hover': {
                backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              },
              '&:active': {
                backgroundColor: isDark ? '#1a1a1a' : '#E5E5E5',
              },
            }}
            aria-label="close sidebar"
          >
            <Close fontSize={isMobile ? 'medium' : 'large'} />
          </IconButton>
        </Box>
        </Fade>

        {/* Content */}
        <Fade in={open} timeout={{ enter: 600, exit: 200 }}>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              padding: { xs: '1rem', sm: '1.5rem' },
              backgroundColor: isDark ? '#000000' : 'transparent',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: isDark ? '#000000' : '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? '#444' : '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: isDark ? '#555' : '#666',
              },
            }}
          >
          {children || (
            <Typography
              variant="body1"
              sx={{
                color: isDark ? '#cccccc' : '#666666',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.6,
              }}
            >
              Sidebar content goes here
            </Typography>
          )}
          </Box>
        </Fade>
      </Box>
    </Drawer>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;

