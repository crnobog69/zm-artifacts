import { useEffect, useState, useCallback } from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { Text, FAB, Portal, Dialog, TextInput, Button, Surface } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import { colors } from '../theme'
import Avatar from '../components/Avatar'
import Logo from '../components/Logo'

export default function GuildsScreen({ navigation }) {
  const { guilds, fetchGuilds, setActiveGuild, createGuild, fetchDMs, connectWS } = useChatStore()
  const me = useAuthStore((s) => s.me)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchGuilds()
    fetchDMs()
    connectWS()
  }, [])

  const handleGuildPress = useCallback(
    (guild) => {
      setActiveGuild(guild)
      navigation.navigate('Channels', { guildName: guild.name })
    },
    [navigation, setActiveGuild],
  )

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const guild = await createGuild(newName.trim())
      setNewName('')
      setDialogOpen(false)
      handleGuildPress(guild)
    } catch {}
    setCreating(false)
  }

  const renderGuild = ({ item }) => (
    <Pressable onPress={() => handleGuildPress(item)} android_ripple={{ color: colors.primary + '30' }}>
      <Surface style={styles.guildCard} elevation={1}>
        <View style={styles.guildIcon}>
          <Text style={styles.guildInitial}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.guildInfo}>
          <Text variant="titleMedium" style={styles.guildName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </Surface>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size={28} />
          <View>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Guilds
            </Text>
            <Text variant="bodySmall" style={styles.headerSub}>
              {me?.username ? `Logged in as ${me.username}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={guilds}
        keyExtractor={(g) => String(g.id)}
        renderItem={renderGuild}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No guilds yet. Create one!</Text>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogOpen(true)} color={colors.onPrimary} />

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Dialog.Title>Create Guild</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Guild name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              autoFocus
              style={{ backgroundColor: colors.surfaceVariant }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreate} loading={creating} disabled={creating}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  headerSub: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  list: {
    padding: 12,
    gap: 8,
  },
  guildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  guildIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildInitial: {
    color: colors.onPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  guildInfo: {
    flex: 1,
    marginLeft: 14,
  },
  guildName: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  empty: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 24,
  },
})
