import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from 'lib/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function fetchDetails() {
        try {
            setLoading(true);
            const response = await api.get(`/viagens/${id}`);
            setTrip(response.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    async function handleDelete() {
        Alert.alert(
            "Excluir Viagem",
            "Tem certeza que deseja apagar esta viagem? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Chamada para o seu backend
                            // O interceptor da api.ts já enviará o Token automaticamente
                            await api.delete(`/viagens/${id}`);

                            Alert.alert("Sucesso", "Viagem removida!");
                            router.replace('/(tabs)'); // Volta para a listagem
                        } catch (error: any) {
                            console.error("Erro ao excluir:", error.response?.data);
                            Alert.alert("Erro", "Não foi possível excluir a viagem.");
                        }
                    }
                }
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView stickyHeaderIndices={[0]}>
                {/* Cabeçalho Fixo ao Scroll */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{trip.titulo}</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.content}>
                    {/* Card de Resumo Financeiro */}
                    <View style={styles.mainCard}>
                        <Text style={styles.totalLabel}>CUSTO TOTAL DA VIAGEM</Text>
                        <Text style={styles.totalValue}>R$ {trip.valorTotal?.toFixed(2)}</Text>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Combustível</Text>
                                <Text style={styles.statValue}>R$ {trip.custoCombustivel}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Pedágios</Text>
                                <Text style={styles.statValue}>R$ {trip.pedagio}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Aluguel</Text>
                                <Text style={styles.statValue}>R$ {trip.aluguelCarro}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Informações de Trajeto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detalhes do Percurso</Text>
                        <View style={styles.infoBox}>
                            <Ionicons name="map-outline" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{trip.trajeto || 'Trajeto não informado'}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{trip.km} KM totais (Consumo: {trip.autonomia} km/l)</Text>
                        </View>
                    </View>

                    {/* Pontos Turísticos (Vindo do seu JSON) */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Roteiro de Visitas</Text>
                            <Text style={styles.countBadge}>{trip.pontosTuristicos?.length || 0}</Text>
                        </View>

                        {trip.pontosTuristicos?.length > 0 ? (
                            trip.pontosTuristicos.map((ponto: any) => (
                                <View key={ponto.id} style={styles.pontoCard}>
                                    <View style={styles.pontoLeft}>
                                        <View style={styles.pontoIcon}>
                                            <Ionicons name="camera" size={20} color="#007AFF" />
                                        </View>
                                        <View>
                                            <Text style={styles.pontoNome}>{ponto.nome}</Text>
                                            <Text style={styles.pontoDesc}>{ponto.descricao}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.pontoPreco}>R$ {ponto.custoEstimado}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyPontos}>Nenhum ponto turístico adicionado ainda.</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        <Text style={styles.deleteButtonText}>Excluir Viagem</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => router.push({
                            pathname: "/edit-trip/[id]",
                            params: { id: id }
                        } as any)} 
                        >
                        <Ionicons name="pencil" size={20} color="#007AFF" />
                        <Text style={styles.editText}>Editar Detalhes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', flex: 1, textAlign: 'center' },
    content: { padding: 20 },
    mainCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    totalLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
    totalValue: { color: '#FFF', fontSize: 36, fontWeight: '900', textAlign: 'center', marginVertical: 8 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: { alignItems: 'center' },
    statLabel: { color: '#666', fontSize: 10, marginBottom: 4 },
    statValue: { color: '#EEE', fontSize: 14, fontWeight: 'bold' },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12 },
    infoText: { color: '#444', fontSize: 15 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    countBadge: { backgroundColor: '#E7F3FF', color: '#007AFF', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
    pontoCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 10
    },
    pontoLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    pontoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E7F3FF', justifyContent: 'center', alignItems: 'center' },
    pontoNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    pontoDesc: { fontSize: 12, color: '#999' },
    pontoPreco: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
    emptyPontos: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0', // Fundo levemente avermelhado
        padding: 15,
        borderRadius: 12,
        marginTop: 30,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#FFC1C1',
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E7F3FF',
        padding: 15,
        borderRadius: 12,
        marginTop: 15, // Espaço entre o excluir e o editar
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#B3D7FF',
    },
    editText: {
        color: '#007AFF',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
});