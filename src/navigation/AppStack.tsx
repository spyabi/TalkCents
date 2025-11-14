// import React, { useState, useEffect } from 'react';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../screens/LoginPage';
// import CreateAccountPage from '../screens/CreateAccountPage';
// import ForgotPasswordPage from '../screens/ForgotPasswordPage';
// import ChatBotScreen from '../screens/ChatBotScreen';
// import CameraScreen from '../screens/CameraScreen';
// import HomeScreen from '../screens/HomeScreen';
// import SettingScreen from '../screens/SettingScreen';
import BottomTabs from './BottomTabs';
import CategoriesEditor from '../screens/CategoryEditor';
// import LoadingSpinner from '../components/LoadingSpinner'
import { checkLogin } from '../utils/auth';

export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  ForgotPassword: undefined;
  HomeTabs: undefined;
  ChatBot: undefined;       // make sure the route name matches your Stack.Screen
  CameraScreen: undefined;
  CategoryEditor: { type: 'income' | 'expense' }; 
};

const Stack = createNativeStackNavigator<AuthStackParamList>();
// const Stack = createNativeStackNavigator();

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
    <Stack.Navigator initialRouteName = {"HomeTabs"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      {/* <Stack.Screen name="CreateAccount" component={CreateAccountPage} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} /> */}
      <Stack.Screen
        name="HomeTabs"
        component={BottomTabs}
        options={{
          headerShown: false,   // you already have this
          title: '',            // ← prevents "HomeTabs" from being used as back label
        }}
      />
      <Stack.Screen
      name="CategoryEditor"
      component={CategoriesEditor}
      options={({ route }) => ({
        headerShown: true,
        title: route.params.type === 'income' ? 'Income Categories' : 'Expense Categories',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#E7E7E7' },
        headerTintColor: '#000',
        headerBackTitleVisible: false,
        headerBackTitle: ' ',
      })}
    />

      {/* <Stack.Screen
      name="ChatBot"
      component={ChatBotScreen}
      options={{
        headerShown: true,
        title: 'AI Chatbot',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#E7E7E7' },
        headerTintColor: '#000',
      }}/>
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{
          headerShown: true,
          title: 'Camera',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#E7E7E7' },
          headerTintColor: '#000',
       }}/> */}
    </Stack.Navigator>
  );
}

