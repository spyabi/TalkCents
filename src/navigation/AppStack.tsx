// import React, { useState, useEffect } from 'react';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../screens/LoginPage';
import CreateAccountPage from '../screens/CreateAccountPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  // const [loading, setLoading] = useState(true);
  // const [initialRoute, setInitialRoute] = useState<'Login' | 'HomeTabs'>('Login');

  useEffect(() => {
    const verify = async () => {
      console.log('permissions', "IM CHECkING LOGIN")
      const token = await checkLogin();
      console.log('permissions', 'my token here', token)
      // setInitialRoute(token ? 'HomeTabs' : 'Login');
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
    </Stack.Navigator>
  );
}

