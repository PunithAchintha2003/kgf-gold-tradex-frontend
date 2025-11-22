import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme);

  // Sync Redux theme with document and localStorage (same as AppContext)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    localStorage.setItem('kgf-theme', theme.mode);
  }, [theme.mode]);

  const toggle = () => {
    dispatch(toggleTheme());
  };

  const setMode = (mode: 'light' | 'dark') => {
    dispatch(setTheme(mode));
  };

  return {
    mode: theme.mode,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light',
    toggle,
    setMode,
  };
};
