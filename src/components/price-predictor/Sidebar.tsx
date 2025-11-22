import React from 'react';
import { Drawer, Box, IconButton, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';

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
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '85%', md: width },
          maxWidth: { xs: '100vw', sm: '90vw', md: width },
          backgroundColor: isDark ? '#111111' : '#FFFFFF',
          borderLeft: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
          boxShadow: isDark 
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
            borderBottom: `1px solid ${isDark ? '#1f1f1f' : '#E0E0E0'}`,
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
                backgroundColor: isDark ? '#2a2a2a' : '#E5E5E5',
              },
            }}
            aria-label="close sidebar"
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
              background: isDark ? '#1a1a1a' : '#f1f1f1',
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
      </Box>
    </Drawer>
  );
};

export default Sidebar;

