// src/lib/token.ts
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'travel-organizer-token'

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync('user-token');
}