import React from 'react';
import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTheme } from '../hooks/useTheme';
import { GiGoldBar } from "react-icons/gi";
import { useGetRealtimePriceQuery, useGetExchangeRateQuery } from '../store/api/goldApi';
import { convertTroyOunceToPawn } from '../utils/currencyConverter';

export type CurrencyUnit = 'troy-ounce' | 'pawn';

interface CurrencyDropdownProps {
  value: CurrencyUnit;
  onChange: (unit: CurrencyUnit) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = React.memo(({ value, onChange }) => {
  const { isDark } = useTheme();

  // Fetch real-time price
  const {
    data: realtimeData,
  } = useGetRealtimePriceQuery(undefined, {
    pollingInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  // Fetch USD/LKR exchange rate
  const {
    data: exchangeRateData,
  } = useGetExchangeRateQuery({ from: 'USD', to: 'LKR' }, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  // Calculate LKR price for 1 Pawn
  const lkrPrice = React.useMemo(() => {
    if (!realtimeData?.current_price || !exchangeRateData?.exchange_rate) {
      return null;
    }
    const converted = convertTroyOunceToPawn(realtimeData.current_price, exchangeRateData.exchange_rate);
    return converted.displayText;
  }, [realtimeData?.current_price, exchangeRateData?.exchange_rate]);

  const handleChange = (event: SelectChangeEvent<CurrencyUnit>) => {
    onChange(event.target.value as CurrencyUnit);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5, 
        marginRight: 1.5,
      }}>
        <Box sx={{
          padding: '0.25rem 0.5rem',
          border: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
          borderRadius: '6px',
          backgroundColor: isDark ? '#1a1a1a' : '#F9F9F9',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minHeight: '2rem',
        }}>
          <GiGoldBar 
            style={{ 
              color: '#F5D300', 
              fontSize: '1.35rem' 
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#F5D300',
              fontSize: '0.95rem',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            24K
          </Typography>
        </Box>
        {lkrPrice && (
          <Box sx={{
            padding: '0.25rem 0.5rem',
            border: `1px solid ${isDark ? '#333333' : '#E0E0E0'}`,
            borderRadius: '6px',
            backgroundColor: isDark ? '#1a1a1a' : '#F9F9F9',
            display: 'flex',
            alignItems: 'center',
            minHeight: '2rem',
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#F5D300',
                fontSize: '0.95rem',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {lkrPrice}
            </Typography>
          </Box>
        )}
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          color: isDark ? '#cccccc' : '#666666',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Unit:
      </Typography>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 140,
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
            '& fieldset': {
              borderColor: isDark ? '#333333' : '#CCCCCC',
            },
            '&:hover fieldset': {
              borderColor: isDark ? '#555555' : '#999999',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F5D300',
            },
          },
          '& .MuiSelect-select': {
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      >
        <Select
          value={value}
          onChange={handleChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Currency unit' }}
        >
          <MenuItem value="troy-ounce">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.875rem' }}>Troy Ounce (USD)</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="pawn">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.875rem' }}>1 Pawn (LKR)</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
});

CurrencyDropdown.displayName = 'CurrencyDropdown';

export default CurrencyDropdown;
