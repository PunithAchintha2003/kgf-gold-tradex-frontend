import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme);

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
