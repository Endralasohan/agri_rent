import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

export const TOKEN_KEY = 'agrirent.token';
export const USER_KEY = 'agrirent.user';

export async function saveSession(token: string, user: User): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function loadSession(): Promise<{ token: string | null; user: User | null }> {
  const [[, token], [, userJson]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const user = userJson ? (JSON.parse(userJson) as User) : null;

  return { token, user };
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
