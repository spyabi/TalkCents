import React, { useRef } from 'react';
import {View, StyleSheet, Pressable } from 'react-native';
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
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const fabRef = useRef<{ popOut: () => void }>(null); // optional, for calling popOut
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={(e) => {
        // Get tap coordinates
        const { pageX, pageY } = e.nativeEvent;

        // Approximate FAB main button area (adjust as needed)
        const fabX = SCREEN_WIDTH - 40 - 70; // right: 40, width: 70
        const fabY = SCREEN_HEIGHT - 40 - 70; // bottom: 40, height: 70

        if (pageX < fabX || pageX > fabX + 70 || pageY < fabY || pageY > fabY + 70) {
          fabRef.current?.popOut?.(); // only pop out if outside FAB
        }
      }}
    >
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Icon name={ICONS[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#466bd0ff',
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
      <FloatingButton ref={fabRef}/>
    </View>
    </Pressable>

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