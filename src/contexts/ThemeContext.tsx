// contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  shadowColor: string;
  switchTrackOff: string;
  headerBackground: string;
  primary: string;
  secondary: string;
}

export const lightTheme: Theme = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1a1a1a',
  textSecondary: '#666666',
  inputBackground: '#F8F9FA',
  inputBorder: '#E0E0E0',
  placeholder: '#999999',
  shadowColor: '#000',
  switchTrackOff: '#D1D1D1',
  headerBackground: '#FFFFFF',
  primary: '#B6771D',
  secondary: '#D4933A',
};

export const darkTheme: Theme = {
  background: '#1a1a1a',
  cardBackground: '#2a2a2a',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  inputBackground: '#3a3a3a',
  inputBorder: '#4a4a4a',
  placeholder: '#999999',
  shadowColor: '#000',
  switchTrackOff: '#3e3e3e',
  headerBackground: '#242424',
  primary: '#B6771D',
  secondary: '#D4933A',
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDarkMode: true,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState<Theme>(darkTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const isDark = savedTheme !== 'light';
      setIsDarkMode(isDark);
      setTheme(isDark ? darkTheme : lightTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setTheme(newMode ? darkTheme : lightTheme);
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
