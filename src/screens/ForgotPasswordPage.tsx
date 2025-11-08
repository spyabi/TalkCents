import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ForgotPasswordPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forgot Password Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});


{/*
possible to use common style sheet that globally? created but pros and cons
import { CommonStyles } from '../styles/common';
export default function HomeScreen() {
  return (
    <View style={CommonStyles.container}>
      <Text style={CommonStyles.title}>Home Screen</Text>
    </View>
  );
}
*/}