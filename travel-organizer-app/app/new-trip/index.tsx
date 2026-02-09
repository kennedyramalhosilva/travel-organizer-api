import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function NewTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados principais
  const [titulo, setTitulo] = useState('');
  const [trajeto, setTrajeto] = useState('');
  const [tipoTransporte, setTipoTransporte] = useState<'CARRO' | 'AVIAO'>('CARRO');
  
  // Datas
  const [dateInicio, setDateInicio] = useState(new Date());
  const [dateFim, setDateFim] = useState(new Date());
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFim, setShowPickerFim] = useState(false);

  // Custos e Logística
  const [km, setKm] = useState('');
  const [autonomia, setAutonomia] = useState('12');
  const [valorGasolina, setValorGasolina] = useState('6.00');
  const [pedagio, setPedagio] = useState('');
  const [aluguelCarro, setAluguelCarro] = useState('');
  const [valorPassagem, setValorPassagem] = useState('');
  const [valorTotalEstimado, setValorTotalEstimado] = useState(0);

  // Hospedagem
  const [nomeHospedagem, setNomeHospedagem] = useState('');
  const [enderecoHospedagem, setEnderecoHospedagem] = useState('');
  const [custoHospedagem, setCustoHospedagem] = useState('');
  // Roteiro
  const [pontos, setPontos] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoPonto, setNovoPonto] = useState({ nome: '', descricao: '', custoEstimado: '' });

  // Lógica para trocar transporte e limpar campos opostos
  const alterarTransporte = (novoTipo: 'CARRO' | 'AVIAO') => {
    setTipoTransporte(novoTipo);
    if (novoTipo === 'CARRO') {
      setValorPassagem(''); // Se vai de carro, zera passagem aérea
    } else {
      setKm('');      // Se vai de avião, zera o KM de estrada da ida
    //   setPedagio(''); // Zera pedágio da estrada
    }
  };

  // Cálculo Automático
  useEffect(() => {
    const vGasolina = parseFloat(valorGasolina) || 0;
    const vKm = parseFloat(km) || 0;
    const vAutonomia = parseFloat(autonomia) || 1; 
    const vPedagio = parseFloat(pedagio) || 0;
    const vAluguel = parseFloat(aluguelCarro) || 0;
    const vPassagem = parseFloat(valorPassagem) || 0;

    const custoCombustivel = (vKm / vAutonomia) * vGasolina;
    const custoPontos = pontos.reduce((acc, p) => acc + (parseFloat(p.custoEstimado) || 0), 0);
    const vCustoHospedagem = parseFloat(custoHospedagem) || 0;

    setValorTotalEstimado(custoCombustivel + vPedagio + vAluguel + vPassagem + custoPontos + vCustoHospedagem);
  }, [km, autonomia, valorGasolina, pedagio, aluguelCarro, valorPassagem, pontos, custoHospedagem]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date, type?: 'inicio' | 'fim') => {
    if (type === 'inicio') {
      setShowPickerInicio(false);
      if (selectedDate) setDateInicio(selectedDate);
    } else {
      setShowPickerFim(false);
      if (selectedDate) setDateFim(selectedDate);
    }
  };

  const removerPonto = (index: number) => {
    setPontos(pontos.filter((_, i) => i !== index));
  };

  async function handleSave() {
    if (!titulo) return Alert.alert('Atenção', 'Dê um título para sua viagem!');

    setLoading(true);
    try {
      // Montagem do objeto exato para o Prisma
      const payloadViagem = {
        titulo,
        tipoTransporte,
        trajeto: trajeto || null, 
        dataInicio: dateInicio.toISOString(),
        dataFim: dateFim.toISOString(),
        nomeHospedagem: nomeHospedagem || null,
        enderecoHospedagem: enderecoHospedagem || null,
        custoHospedagem: parseFloat(custoHospedagem) || 0,
        km: parseFloat(km) || 0,
        autonomia: parseFloat(autonomia) || 0,
        valorGasolina: parseFloat(valorGasolina) || 0,
        pedagio: parseFloat(pedagio) || 0,
        aluguelCarro: parseFloat(aluguelCarro) || 0,
        valorPassagem: parseFloat(valorPassagem) || 0
      };

      console.log("Enviando dados:", JSON.stringify(payloadViagem, null, 2));

      const { data } = await api.post('/viagens', payloadViagem);
      
      if (pontos.length > 0) {
        await Promise.all(pontos.map(p => 
          api.post('/pontos-turisticos', { 
            nome: p.nome,
            descricao: p.descricao || '',
            custoEstimado: parseFloat(p.custoEstimado) || 0,
            viagemId: data.id 
          })
        ));
      }

      Alert.alert("Sucesso", "Viagem salva! Boa viagem! ✈️");
      router.replace('/home');
      
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error);
      // Tratamento de erro detalhado para você descobrir o motivo
      if (error.response) {
        Alert.alert('Erro no Servidor', `Status: ${error.response.status}\n${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        Alert.alert('Erro de Conexão', 'O App não conseguiu falar com o backend. Verifique o IP na api.ts');
      } else {
        Alert.alert('Erro', error.message);
      }
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.totalHeader}>
        <Text style={styles.totalLabel}>Custo Estimado</Text>
        <Text style={styles.totalValue}>R$ {valorTotalEstimado.toFixed(2)}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.form}>
          <Text style={styles.label}>Destino, Trajeto e Datas</Text>
          <Text style={styles.labelSmall}>DESTINO</Text>
          <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Viagem de Natal" />
            <Text style={styles.labelSmall}>TRAJETO</Text>
            <TextInput style={styles.input} value={trajeto} onChangeText={setTrajeto} placeholder="Ex: Por Curitiba" />

          <View style={styles.row}>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPickerInicio(true)}>
              <Text style={styles.labelSmall}>IDA</Text>
              <Text style={styles.dateText}>{dateInicio.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPickerFim(true)}>
              <Text style={styles.labelSmall}>VOLTA</Text>
              <Text style={styles.dateText}>{dateFim.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
          </View>

          {showPickerInicio && <DateTimePicker value={dateInicio} mode="date" onChange={(e, d) => onDateChange(e, d, 'inicio')} />}
          {showPickerFim && <DateTimePicker value={dateFim} mode="date" onChange={(e, d) => onDateChange(e, d, 'fim')} />}

          <Text style={styles.label}>Hospedagem</Text>
          <View style={styles.section}>
            <Text style={styles.labelSmall}>HOTEL/POUSADA</Text>
            <TextInput style={styles.input} placeholder="Hotel/Pousada" value={nomeHospedagem} onChangeText={setNomeHospedagem} />
            <Text style={styles.labelSmall}>ENDEREÇO</Text>
            <TextInput style={styles.input} placeholder="Endereço" value={enderecoHospedagem} onChangeText={setEnderecoHospedagem} />
            <Text style={styles.labelSmall}>CUSTO ESTIMADO (R$)</Text>
            <TextInput style={styles.input} placeholder="Custo Estimado (R$)" keyboardType="numeric" value={custoHospedagem} onChangeText={setCustoHospedagem} />
          </View>

          <Text style={styles.label}>Transporte</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, tipoTransporte === 'CARRO' && styles.tabActive]} 
              onPress={() => alterarTransporte('CARRO')} // Função nova aqui
            >
              <Ionicons name="car" size={20} color={tipoTransporte === 'CARRO' ? '#FFF' : '#666'} />
              <Text style={[styles.tabText, tipoTransporte === 'CARRO' && styles.tabTextActive]}>Carro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, tipoTransporte === 'AVIAO' && styles.tabActive]} 
              onPress={() => alterarTransporte('AVIAO')} // Função nova aqui
            >
              <Ionicons name="airplane" size={20} color={tipoTransporte === 'AVIAO' ? '#FFF' : '#666'} />
              <Text style={[styles.tabText, tipoTransporte === 'AVIAO' && styles.tabTextActive]}>Avião</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            {tipoTransporte === 'AVIAO' && (
            <View style={{ marginBottom: 10 }}>
                <Text style={styles.labelSmall}>VALOR DAS PASSAGENS (R$)</Text>
                <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                keyboardType="numeric" 
                value={valorPassagem} 
                onChangeText={setValorPassagem} 
                />
            </View>
            )}

             <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.labelSmall}>KM</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={km} onChangeText={setKm} placeholder={'KM Ida/Volta'} />
                </View>
                <View style={styles.col}>
                    <Text style={styles.labelSmall}>AUTONOMIA</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={autonomia} onChangeText={setAutonomia} />
                </View>
             </View>
             <Text style={styles.labelSmall}>GASOLINA</Text>
             <TextInput style={styles.input} placeholder="Preço Gasolina" keyboardType="numeric" value={valorGasolina} onChangeText={setValorGasolina} />
             <Text style={styles.labelSmall}>PEDÁGIOS</Text>
             <TextInput style={styles.input} placeholder={"Pedágios"} keyboardType="numeric" value={pedagio} onChangeText={setPedagio} />
             <Text style={styles.labelSmall}>ALUGUEL</Text>
             <TextInput style={styles.input} placeholder={"Aluguel Carro / Uber"} keyboardType="numeric" value={aluguelCarro} onChangeText={setAluguelCarro} />
          </View>

          <Text style={styles.label}>Roteiro</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.addPontoBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addPontoText}>Novo Ponto Turístico</Text>
            </TouchableOpacity>
            {pontos.map((p, i) => (
              <View key={i} style={styles.pontoRow}>
                <View style={{flex: 1}}>
                    <Text style={styles.pontoName}>• {p.nome}</Text>
                    <Text style={styles.pontoPrice}>R$ {p.custoEstimado}</Text>
                </View>
                <TouchableOpacity onPress={() => removerPonto(i)} style={{padding: 5}}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.btnFinal} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnFinalText}>SALVAR VIAGEM</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Novo Passeio</Text>
            <TextInput style={styles.input} placeholder="Nome do local" value={novoPonto.nome} onChangeText={t => setNovoPonto({...novoPonto, nome: t})} />
            <TextInput style={styles.input} placeholder="Descrição (opcional)" value={novoPonto.descricao} onChangeText={t => setNovoPonto({...novoPonto, descricao: t})} />
            <TextInput style={styles.input} placeholder="Custo (R$)" keyboardType="numeric" value={novoPonto.custoEstimado} onChangeText={t => setNovoPonto({...novoPonto, custoEstimado: t})} />
            <TouchableOpacity style={styles.btnFinal} onPress={() => {
              setPontos([...pontos, novoPonto]);
              setNovoPonto({nome: '', descricao: '', custoEstimado: ''});
              setModalVisible(false);
            }}><Text style={styles.btnFinalText}>Adicionar</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  totalHeader: { backgroundColor: '#1A1A1A', padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  totalLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  totalValue: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 5 },
  form: { padding: 20 },
  label: { fontSize: 12, fontWeight: '900', color: '#BBB', textTransform: 'uppercase', marginTop: 25, marginBottom: 10 },
  labelSmall: { fontSize: 9, fontWeight: 'bold', color: '#CCC' },
  input: { borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 10, fontSize: 16, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 15 },
  col: { flex: 1 },
  dateSelector: { flex: 1, padding: 15, backgroundColor: '#F9F9F9', borderRadius: 15 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  tabContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 12, backgroundColor: '#F8F9FA' },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontWeight: 'bold', color: '#666' },
  tabTextActive: { color: '#FFF' },
  section: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 20, marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  addPontoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  addPontoText: { color: '#007AFF', fontWeight: 'bold' },
  pontoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },
  pontoName: { color: '#333', fontWeight: '600' },
  pontoPrice: { fontWeight: 'bold', color: '#007AFF', fontSize: 12 },
  btnFinal: { backgroundColor: '#007AFF', padding: 20, borderRadius: 18, marginTop: 30, alignItems: 'center' },
  btnFinalText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cancelText: { textAlign: 'center', color: 'red', marginTop: 15, fontWeight: 'bold' }
});