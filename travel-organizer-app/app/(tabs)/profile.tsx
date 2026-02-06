import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react'; // Adicionado useEffect e useState
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from 'lib/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        // Chamada para buscar os dados do perfil logado
        // Se você não tiver o /auth/me, pode tentar /users/profile ou similar que você criou
        const response = await api.get('/auth/me'); 
        setUser(response.data);
      } catch (error) {
        console.log("Erro ao buscar dados do usuário", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login') 
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={50} color="#007AFF" />
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Organizador de Viagens'}</Text>
          </>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color="#444" />
          <Text style={styles.menuText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#444" />
          <Text style={styles.menuText}>Privacidade</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>Sair do Aplicativo</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.version}>Versão 1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    alignItems: 'center', 
    paddingVertical: 40, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  menu: { marginTop: 20, backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    marginLeft: 16
  },
  menuText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#333' },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 20 }
});