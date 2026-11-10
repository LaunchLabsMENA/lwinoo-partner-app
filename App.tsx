import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/i18n';
import { AppNavigator } from './src/navigation';
import { SetupProvider } from './src/state/setup';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LanguageProvider>
        <SetupProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SetupProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
