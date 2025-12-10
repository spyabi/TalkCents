import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { loginUser } from '../utils/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ---- Route names for the navigator that owns LoginPage ----
type AuthStackParamList = {
  Login: undefined;
  HomeTabs: undefined;
  ForgotPassword: undefined;
  CreateAccount: undefined;
  Chatbot: undefined;
};

// Props for this screen
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const { width } = Dimensions.get('window');
// const { height } = Dimensions.get('window');

export default function LoginPage({ navigation }: Props) {
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
      colors={['#f7fbff', '#e2ecff', '#d4e2ff']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <View style={styles.page}>
        <Image source={require('../assets/TalkCents_logo.png')} style={styles.logo} />

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Welcome back! Please login to your{'\n'}account!
        </Text>

        {/* White card with form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
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
              placeholderTextColor="#9ca3af"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <Text style={styles.accountText}>
            Don’t have an account?{' '}
            <Text
              style={styles.linkHighlight}
              onPress={() => navigation.navigate('CreateAccount')}
            >
              Create account
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
//     <LinearGradient
//       //colors={['#0099CC', '#7DF1FF', '#B3EBF2', '#EAF8FB']} // gradient colors
//       //colors={['#00C8FF', '#7DF1FF', '#B3EBF2', '#E6F7F9']}
//       colors={['#00C8FF', '#7DF1FF', '#A4F0F3', '#B3EBF2', '#D6F7F9']}
//       start={{ x: 0.5, y: 0 }}     // top-middle
//       end={{ x: 1, y: 1 }}       // bottom-right
//       style={styles.background}
//     >
//       <View style={styles.container}>
//         <Image source={require('../assets/TalkCents_logo.png')} style={styles.logo} />
//         <Text style={styles.title}>Welcome back! Please login to your account!</Text>

//         <View style={styles.inputGroup}>
//           <Text style={styles.inputLabel}>Username / Email</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your username/email"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.inputLabel}>Password</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             placeholderTextColor="#999"
//           />
//         </View>
//         {error ? <Text style={styles.error}>{error}</Text> : null}
//         <TouchableOpacity style={styles.button} onPress={handleLogin}>

//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
//           <Text style={styles.linkText}>Forgot Password?</Text>
//         </TouchableOpacity>

//         <Text style={styles.AccountText}>
//           Don’t have an account?{' '}
//           <Text
//             style={styles.linkHighlight}
//             onPress={() => navigation.navigate('CreateAccount')}
//           >
//             Create Account
//           </Text>
//         </Text>
//       </View>
//     </LinearGradient>
//   );
// }

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#111827',
    marginBottom: 32,
    paddingTop: 10,
  },
  card: {
    width: width * 0.86,   
    // height: height * 0.7,  
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 32,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: '#111827',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
   logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  accountText: {
    color: '#111827',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '300',
  },
  linkHighlight: {
    color: '#2563eb',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '500',
  },
});

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: width * 0.85,      // 85% of screen width
//     height: height * 0.7,      // 60% of screen height
//     padding: 10,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,1.0)', // white
//     shadowColor: '#000', //ios shadow
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 5 },
//     elevation: 5, // for Android shadow
//     justifyContent: 'space-between',
//   },
//   logo: {
//     width: width * 0.4,
//     height: width * 0.4,
//     resizeMode: 'contain',
//     alignSelf: 'center',
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '300',
//     marginTop: 10,
//     marginBottom: 10,
//     marginHorizontal: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   inputGroup: {
//     width: '100%',
//   },

//   inputLabel: {
//     color: '#000000',
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     textAlign: 'left',
//   },
//   input: {
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     color: '#333',
//     backgroundColor: '#F3F3F3',
//   },
//   button: {
//     backgroundColor: '#000000',
//     padding: 10,
//     borderRadius: 20,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   linkText: {
//     color: '#000000',
//     textAlign: 'center',
//     fontSize: 14,
//     textDecorationLine: 'underline'
//   },
//   AccountText: {
//       color: '#0000000',
//       textAlign: 'center',
//       fontSize: 14,
//       fontWeight: '300',
//   },
//   linkHighlight: {
//     color: '#4c669f',
//     fontWeight: 'bold',
//     fontSize: 14,
//     textDecorationLine: 'underline'
//   },
//   error: {
//     color: '#ff3b30',          // red
//     textAlign: 'center',
//     marginBottom: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });