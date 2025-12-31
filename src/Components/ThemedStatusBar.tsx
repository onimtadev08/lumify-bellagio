// src/components/ThemedStatusBar.tsx
import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedStatusBar: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#1a1a1a' : '#F5F5F5'}
      translucent={false}
    />
  );
};

export default ThemedStatusBar;
