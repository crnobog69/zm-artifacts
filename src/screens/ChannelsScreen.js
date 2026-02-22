import { useEffect, useState, useCallback } from 'react'
import { View, SectionList, StyleSheet, Pressable } from 'react-native'
import { Text, FAB, Portal, Dialog, TextInput, Button, IconButton } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { colors } from '../theme'

export default function ChannelsScreen({ navigation, route }) {
  const { channels, categories, activeGuild, setActiveChannel, fetchMembers } = useChatStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const { fetchChannels } = useChatStore()

  useEffect(() => {
    if (activeGuild) {
      fetchChannels(activeGuild.id)
      fetchMembers(activeGuild.id)
    }
  }, [activeGuild?.id])

  const handleChannelPress = useCallback(
    (ch) => {
      setActiveChannel(ch)
      navigation.navigate('Chat', { channelName: ch.name })
    },
    [navigation, setActiveChannel],
  )

  const handleCreate = async () => {
    if (!newName.trim() || !activeGuild) return
    setCreating(true)
    try {
      const { api } = require('../api/client')
      const ch = await api(`/guilds/${activeGuild.id}/channels`, {
        method: 'POST',
        body: { name: newName.trim(), kind: 'text' },
      })
      setNewName('')
      setDialogOpen(false)
      fetchChannels(activeGuild.id)
    } catch {}
    setCreating(false)
  }

  // Group channels by category
  const sections = buildSections(channels, categories)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle} numberOfLines={1}>
          {route.params?.guildName || 'Channels'}
        </Text>
        <IconButton
          icon="account-group"
          iconColor={colors.onSurfaceVariant}
          onPress={() => navigation.navigate('Members')}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(ch) => String(ch.id)}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Text variant="labelMedium" style={styles.categoryLabel}>
              {section.title.toUpperCase()}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleChannelPress(item)}
            android_ripple={{ color: colors.primary + '30' }}
          >
            <View style={styles.channelRow}>
              <Text style={styles.channelIcon}>{item.kind === 'voice' ? '🔊' : '#'}</Text>
              <Text variant="bodyLarge" style={styles.channelName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No channels yet</Text>
        }
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogOpen(true)} color={colors.onPrimary} />

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Dialog.Title>Create Channel</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Channel name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              autoFocus
              style={{ backgroundColor: colors.surfaceVariant }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreate} loading={creating}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

function buildSections(channels, categories) {
  if (!channels || channels.length === 0) return []

  const catMap = {}
  for (const cat of categories || []) {
    catMap[cat.id] = cat.name
  }

  const grouped = {}
  const uncategorized = []

  for (const ch of channels) {
    if (ch.category_id && catMap[ch.category_id]) {
      const key = ch.category_id
      if (!grouped[key]) grouped[key] = { title: catMap[key], data: [] }
      grouped[key].data.push(ch)
    } else {
      uncategorized.push(ch)
    }
  }

  const sections = []
  if (uncategorized.length > 0) sections.push({ title: '', data: uncategorized })
  for (const cat of categories || []) {
    if (grouped[cat.id]) sections.push(grouped[cat.id])
  }
  return sections
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    color: colors.onSurface,
    fontWeight: '700',
    flex: 1,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  categoryLabel: {
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 6,
    letterSpacing: 0.8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 1,
  },
  channelIcon: {
    color: colors.onSurfaceVariant,
    fontSize: 18,
    width: 28,
    fontWeight: '700',
  },
  channelName: {
    color: colors.onSurface,
    flex: 1,
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
