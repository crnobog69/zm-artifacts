import { useEffect, useCallback } from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { colors } from '../theme'
import Avatar from '../components/Avatar'

export default function DMsScreen({ navigation }) {
  const { dms, fetchDMs, setActiveDM } = useChatStore()

  useEffect(() => {
    fetchDMs()
  }, [])

  const handlePress = useCallback(
    (dm) => {
      setActiveDM(dm)
      const otherUser = dm.members?.find((m) => m.username) || {}
      navigation.navigate('DMChat', { dmName: otherUser.username || 'DM' })
    },
    [navigation, setActiveDM],
  )

  const renderDM = ({ item }) => {
    const other = item.members?.find((m) => m.username) || {}
    return (
      <Pressable onPress={() => handlePress(item)} android_ripple={{ color: colors.primary + '30' }}>
        <View style={styles.dmRow}>
          <Avatar user={other} size={44} />
          <View style={styles.dmInfo}>
            <Text variant="titleSmall" style={styles.dmName} numberOfLines={1}>
              {other.username || `Thread ${item.id}`}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Messages
        </Text>
      </View>

      <FlatList
        data={dms}
        keyExtractor={(d) => String(d.id)}
        renderItem={renderDM}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 8,
  },
  dmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  dmInfo: {
    flex: 1,
    marginLeft: 14,
  },
  dmName: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  empty: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 40,
  },
})
