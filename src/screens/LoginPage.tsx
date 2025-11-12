import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { loginUser } from '../utils/auth';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    console.log('permissions', "I TRYING TO LOG IN ");
    try {
      const token = await loginUser(email, password);
      if (token) {
        // ✅ Once logged in, reset navigation to HomeTabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        });
      }
    } catch (err) {
      console.log('permissions', err);
      setError('Invalid credentials');
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <LinearGradient
      //colors={['#0099CC', '#7DF1FF', '#B3EBF2', '#EAF8FB']} // gradient colors
      //colors={['#00C8FF', '#7DF1FF', '#B3EBF2', '#E6F7F9']}
      colors={['#00C8FF', '#7DF1FF', '#A4F0F3', '#B3EBF2', '#D6F7F9']}
      start={{ x: 0.5, y: 0 }}     // top-middle
      end={{ x: 1, y: 1 }}       // bottom-right
      style={styles.background}
    >
      <View style={styles.container}>
        <Image source={require('../assets/TalkCents_logo.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome back! Please login to your account!</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username / Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username/email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Text style={styles.AccountText}>
          Don’t have an account?{' '}
          <Text
            style={styles.linkHighlight}
            onPress={() => navigation.navigate('CreateAccount')}
          >
            Create Account
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,      // 85% of screen width
    height: height * 0.7,      // 60% of screen height
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,1.0)', // white
    shadowColor: '#000', //ios shadow
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5, // for Android shadow
    justifyContent: 'space-between',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '300',
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    width: '100%',
  },

  inputLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#333',
    backgroundColor: '#F3F3F3',
  },
  button: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  AccountText: {
      color: '#0000000',
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '300',
  },
  linkHighlight: {
    color: '#4c669f',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
});
