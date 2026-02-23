import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { TextInput, Button, Text, SegmentedButtons, Surface } from 'react-native-paper'
import { useAuthStore } from '../stores/auth'
import { colors } from '../theme'
import Logo from '../components/Logo'

export default function LoginScreen() {
  const [mode, setMode] = useState('login')
  const [serverUrl, setServerUrl] = useState('http://localhost:8787')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuthStore()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(serverUrl, email, password)
      } else {
        await register(serverUrl, email, username, password)
      }
    } catch (e) {
      const msg = e.message || 'Something went wrong'
      if (msg === 'Network request failed') {
        setError(`Cannot reach server at ${serverUrl}\n\nMake sure the server is running and reachable from this device. On Android, HTTP (non-HTTPS) connections may be blocked — try using https:// or rebuild the app with cleartext traffic enabled.`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Surface style={styles.card} elevation={3}>
          <View style={styles.logoRow}>
            <Logo size={40} />
            <Text variant="headlineMedium" style={styles.title}>
              Zlikord
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {mode === 'login' ? 'Welcome back!' : 'Create an account'}
          </Text>

          <SegmentedButtons
            value={mode}
            onValueChange={setMode}
            style={styles.tabs}
            buttons={[
              { value: 'login', label: 'Login' },
              { value: 'register', label: 'Register' },
            ]}
          />

          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="server" />}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
          />

          {mode === 'register' && (
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="account" />}
            />
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            left={<TextInput.Icon icon="lock" />}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    backgroundColor: colors.surface,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  tabs: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 14,
    backgroundColor: colors.surfaceVariant,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 24,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
})
