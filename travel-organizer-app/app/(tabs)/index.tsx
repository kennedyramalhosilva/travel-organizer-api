import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from 'lib/api'; // Sua instância do Axios
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Viagem {
  id: number;
  titulo: string;
  tipoTransporte: string;
  valorTotal: number;
  trajeto: string;
}

export default function Home() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar as viagens do usuário logado
  async function fetchViagens() {
    try {
      setLoading(true);
      // O back-end já filtra pelo usuário logado via JWT 
      const response = await api.get('/viagens');
      setViagens(response.data);
    } catch (error) {
      console.error("Erro ao carregar viagens:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchViagens();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com Boas-vindas e Logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Minhas Viagens ✈️</Text>
          <Text style={styles.subtitle}>Organize seus roteiros</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login')} 
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : viagens.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
          <Text style={styles.emptySub}>Que tal planejar a primeira?</Text>
        </View>
      ) : (
        <FlatList 
          data={viagens}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardBadge}>{item.tipoTransporte}</Text>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardInfo}>
                  <Ionicons name="cash-outline" size={14} /> Total: R$ {item.valorTotal?.toFixed(2)}
                </Text>
                <Text style={styles.cardInfo}>
                  <Ionicons name="location-outline" size={14} /> {item.trajeto || 'Trajeto não definido'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      {/* Botão Flutuante Principal  */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/new-trip')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666' },
  logoutBtn: { padding: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#999', marginTop: 8 },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  cardBadge: { 
    backgroundColor: '#E7F3FF', 
    color: '#007AFF', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    fontSize: 10, 
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  cardBody: { gap: 6 },
  cardInfo: { color: '#666', fontSize: 14 },
});