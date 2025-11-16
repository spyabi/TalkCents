// import React, { useState, useEffect } from 'react';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginPage from '../screens/LoginPage';
import CreateAccountPage from '../screens/CreateAccountPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import BottomTabs from './BottomTabs';
import ManualEntryPage from '../screens/ManualEntryPage';
import { Transaction } from '../context/TransactionsContext';
// import LogScreen from '../screens/LogScreen';
// import ChatBotScreen from '../screens/ChatBotScreen';
// import CameraScreen from '../screens/CameraScreen';
import CategoryEditor from '../screens/CategoryEditor';
// import LoadingSpinner from '../components/LoadingSpinner'
import { checkLogin } from '../utils/auth';

export type AuthStackParamList = {
   Login: undefined; 
   CreateAccount: undefined; 
   ForgotPassword: undefined; 
   HomeTabs: undefined; 
   ChatBot: undefined;
   CameraScreen: undefined;
   CategoryEditor: { type: 'income' | 'expense' };
  LogScreen: { recentDate?: string; justAddedId?: string } | undefined;
  ManualEntry: { item: Transaction | null } | undefined;
 };

const Stack = createNativeStackNavigator<AuthStackParamList>(); 

export default function AppStack() {
  // const [loading, setLoading] = useState(true);
  // const [initialRoute, setInitialRoute] = useState<'Login' | 'HomeTabs'>('Login');
  // const [ setInitialRoute] = useState<'Login' | 'HomeTabs'>('Login');
  Icon.loadFont();


  useEffect(() => {
    const verify = async () => {
      console.log('permissions', "IM CHECkING LOGIN")
      const token = await checkLogin();
      console.log('permissions', 'my token here', token)
      // setInitialRoute(token ? 'HomeTabs' : 'Login');
      // setInitialRoute('HomeTabs');
      // setLoading(false);
    };
    verify();
  }, []);

  // if (loading) return <LoadingSpinner/>;

  return (
    <Stack.Navigator initialRouteName = "HomeTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <Stack.Screen name="HomeTabs" component={BottomTabs} />
      <Stack.Screen name="ManualEntry" component={ManualEntryPage} />
      {/* <Stack.Screen name= "LogScreen" component={LogScreen} /> */}
      {/* <Stack.Screen
        name="ChatBot"                               
        component={ChatBotScreen}
        options={{
          headerShown: true,
          title: 'AI Chatbot',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#E7E7E7' },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{
          headerShown: true,
          title: 'Camera',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#E7E7E7' },
          headerTintColor: '#000',
        }}
      /> */}
      <Stack.Screen
        name="CategoryEditor"
        component={CategoryEditor}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.type === 'income' ? 'Income Categories' : 'Expense Categories',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#E7E7E7' },
          headerTintColor: '#000',
          headerBackTitleVisible: false, 
          headerBackButtonDisplayMode: 'minimal',
        })}
      />
    </Stack.Navigator>
  );
}

