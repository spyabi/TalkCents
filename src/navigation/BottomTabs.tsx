import React from 'react';
import {View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Platform } from 'react-native';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import InsightScreen from '../screens/InsightScreen';
import LogScreen from '../screens/LogScreen';
import SettingScreen from '../screens/SettingScreen';
import FloatingButton from '../components/FloatingButton';

export type BottomTabParamList = {
  Home: undefined;
  Log: undefined;
  Insights: undefined;
  Settings: undefined;
};


// const Tab = createBottomTabNavigator();
const Tab = createBottomTabNavigator<BottomTabParamList>();


const ICONS: Record<string, string> = {
  Home: 'home',
  Log: 'reader',
  Insights: 'analytics',
  Settings: 'settings',
};

export default function BottomTabs() {
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Icon name={ICONS[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#9DB7FF',
          tabBarInactiveTintColor: '#000000',
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItemStyle
        })}
      > 
      <Tab.Screen name="Insights" component={InsightScreen} />
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Log" component={LogScreen} /> 
        <Tab.Screen name="Settings" component={SettingScreen} />
      </Tab.Navigator>
      <FloatingButton/>
    </View>

  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', //relative, fixed, absolute
    bottom: 16,
    height: 60,
    marginHorizontal: 16,
    borderRadius: 30,
    backgroundColor: '#E7E7E7',
    shadowColor: '#000', //iOS shadow color. For Android, use elevation.
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 2,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    // paddingBottom: 20
  },
  tabBarItemStyle: {
//     justifyContent: "center",
    margin: 5, //for some reason justifyContent does not work, need margin
  },
//   oval: {
//     backgroundColor: '#007AFF',
//     borderRadius: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//   },
});