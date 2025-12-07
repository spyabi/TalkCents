import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TutorialScreen from './TutorialScreen';
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AppStack";

type Props = NativeStackScreenProps<AuthStackParamList, "CreateAccount">;

export default function CreateAccountPage({ navigation }: Props) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient
      //colors={['#0099CC', '#7DF1FF', '#B3EBF2', '#EAF8FB']} // gradient colors
      //colors={['#00C8FF', '#7DF1FF', '#B3EBF2', '#E6F7F9']}
      colors={['#f7fbff', '#e2ecff', '#d4e2ff']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create a new account</Text>

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

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            // onPress={() => console.log('Create Account pressed')}
            onPress={() => navigation.replace("Tutorial")}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#000000',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#B6B6B6',
  },
  createButton: {
    backgroundColor: '#000000', //
  },
});
