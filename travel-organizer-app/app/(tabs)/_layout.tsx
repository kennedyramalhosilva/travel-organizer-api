import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007AFF', // Cor do ícone ativo
      headerShown: false,               // Esconde o título no topo (já fizemos o nosso)
    }}>
      
      {/* Primeira Aba: Home (Minhas Viagens) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Viagens',
          tabBarIcon: ({ color }) => <Ionicons name="airplane" size={24} color={color} />,
        }}
      />
      {/* Segunda Aba: Perfil */}
      <Tabs.Screen
        name="profile" // Se você renomeou o arquivo para profile.tsx
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
      
    </Tabs>
  );
}