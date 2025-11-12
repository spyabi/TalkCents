import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logoutUser } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';

export default function SettingScreen() {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await logoutUser();
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // replace 'Login' with your login screen name
      });
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Setting Screen</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});