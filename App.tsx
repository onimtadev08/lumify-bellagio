// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

import ThemedStatusBar from './src/Components/ThemedStatusBar';
import { ThemeProvider } from './src/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
