import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../screens/LoginPage';
import CreateAccountPage from '../screens/CreateAccountPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import ChatBotScreen from '../screens/ChatBotScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName = "HomeTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <Stack.Screen name="HomeTabs" component={BottomTabs} />
      <Stack.Screen
      name="ChatBot"
      component={ChatBotScreen}
      options={{
        headerShown: true,
        title: 'AI Chatbot',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#E7E7E7' },
        headerTintColor: '#000',
      }}/>
    </Stack.Navigator>
  );
}