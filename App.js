import 'react-native-gesture-handler'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider, ActivityIndicator } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import { theme, colors } from './src/theme'
import Navigation from './src/navigation'
import { useAuthStore } from './src/stores/auth'

export default function App() {
  const loading = useAuthStore((s) => s.loading)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Navigation />
      </PaperProvider>
    </SafeAreaProvider>
  )
}
