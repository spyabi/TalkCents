/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FloatingButton from './src/components/FloatingButton';
import LoginPage from './src/screens/LoginPage';
import BottomTabs from './src/navigation/BottomTabs';
import AppStack from './src/navigation/AppStack';
import { TransactionsProvider } from './src/utils/TransactionsContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  Icon.loadFont();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#E7F0FF'}}>
      {/* <LoginPage/> */}
      {/* <BottomTabs/>
      <FloatingButton/> */}
      <TransactionsProvider>
        <NavigationContainer>
          <AppStack />
        </NavigationContainer>
      </TransactionsProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
