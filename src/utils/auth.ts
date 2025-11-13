// utils/auth.ts
import * as Keychain from 'react-native-keychain';
import { NativeModules } from 'react-native';


const API_URL = 'http://18.234.224.108:8000/api/user';

export async function loginUser(email: string, password: string): Promise<string> {
  console.log('permissions', 'Keychain module:', Keychain);
  console.log('permissions', 'NativeModule Keychain:', NativeModules.RNKeychainManager);
  console.log('permissions', email, password);
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email,
      password: password
    })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  const token = data.access_token;
  console.log('permissions', "I LOGGED IN", "TOKEN:", token)
  // Securely store token
  await Keychain.setGenericPassword('user', token, { service: 'TalkCentsAuthToken' });
  return token;
}

export async function checkLogin(): Promise<string | null> {
  // Try to get the stored token
  const storedToken = await getToken();

  if (storedToken) {
    try {
      // Check if the token is valid by calling the verify endpoint
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('permissions', 'Token is valid!');
        return storedToken; // token still valid
      } else {
        console.log('permissions', 'Stored token invalid, need login.');
      }
    } catch (err) {
      console.warn('permissions', 'Error verifying token:', err);
    }
  }
  return null;
}

export async function getToken(): Promise<string | null> {
  console.log('permissions', "IM GETTING TOKEN")
  const credentials = await Keychain.getGenericPassword({ service: 'TalkCentsAuthToken' });
  console.log('permissions', "my credentials", credentials)
  if (credentials) {
    return credentials.password; // the token
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  try {
    const credentialsBefore = await Keychain.getGenericPassword({ service: 'TalkCentsAuthToken' });
    console.log('permissions', 'MY TOKEN BEFORE:', credentialsBefore?.password);

    // Reset / delete credentials
    await Keychain.resetGenericPassword({ service: 'TalkCentsAuthToken' });

    const credentialsAfter = await Keychain.getGenericPassword({ service: 'TalkCentsAuthToken' });
    console.log('permissions', 'MY TOKEN AFTER:', credentialsAfter?.password); // should be undefined / null
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
