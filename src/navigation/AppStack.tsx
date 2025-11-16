import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../screens/LoginPage';
import CreateAccountPage from '../screens/CreateAccountPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import ManualEntryPage from '../screens/ManualEntryPage';
import LogScreen from '../screens/LogScreen';
import BottomTabs from './BottomTabs';
import { Transaction } from '../context/TransactionsContext';

export type AppStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  ForgotPassword: undefined;
  HomeTabs: undefined;
  ManualEntry: {
    item?: Transaction | null;
  };
  LogScreen: {
    recentDate?: string;
  } | undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();


export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName = "LogScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <Stack.Screen name="HomeTabs" component={BottomTabs} />
      <Stack.Screen name="ManualEntry" component={ManualEntryPage} />
      <Stack.Screen name= "LogScreen" component={LogScreen} />
    </Stack.Navigator>
  );
}