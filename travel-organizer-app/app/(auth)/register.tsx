import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useState } from 'react'
import { api } from 'lib/api'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      })

      Alert.alert('Sucesso! 🎉', 'Conta criada com sucesso. Agora é só fazer o login.')
      router.replace('/(auth)/login')
    } catch (err: any) {
      console.log("ERRO REGISTRO:", err.response?.data || err.message)
      Alert.alert('Erro', 'Não conseguimos criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova Conta</Text>
            <Text style={styles.subtitle}>Comece a organizar suas viagens hoje mesmo</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Como quer ser chamado?" 
              value={name} 
              onChangeText={setName} 
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Crie uma senha forte"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Criando...' : 'Criar minha conta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
              <Text style={styles.linkText}>
                Já tem uma conta? <Text style={styles.linkBold}>Fazer login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24, paddingTop: 20 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#444' },
  input: {
    height: 56,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordInput: { flex: 1, height: '100%', fontSize: 16 },
  button: {
    height: 56,
    backgroundColor: '#20c997',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center', paddingBottom: 40 },
  linkText: { fontSize: 14, color: '#666' },
  linkBold: { color: '#20c997', fontWeight: 'bold' },
})