// app/_layout.tsx
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/token'

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    getToken().then(token => {
      setIsAuthenticated(!!token)
    })
  }, [])

  if (isAuthenticated === null) {
    return null // splash simples (depois melhoramos)
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  )
}
