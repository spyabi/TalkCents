// utils/auth.ts
import * as Keychain from 'react-native-keychain';

const API_URL = 'http://18.234.224.108:8000/api/user/login';

export async function loginUser(email: string, password: string): Promise<string> {
  console.log('permissions', email, password);
  const response = await fetch(API_URL, {
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
  // 🔒 Securely store token
//   await Keychain.setGenericPassword('user', token);
  return token;
}

export async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return credentials.password; // the token
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  await Keychain.resetGenericPassword();
}
