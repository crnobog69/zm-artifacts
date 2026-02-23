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
      navigation.navigate('DMChat', { dmName: dm.other_username || 'DM' })
    },
    [navigation, setActiveDM],
  )

  const renderDM = ({ item }) => {
    const otherUser = {
      id: item.other_user_id,
      username: item.other_username,
      avatar_url: item.other_avatar_url,
    }
    return (
      <Pressable onPress={() => handlePress(item)} android_ripple={{ color: colors.primary + '30' }}>
        <View style={styles.dmRow}>
          <Avatar user={otherUser} size={44} />
          <View style={styles.dmInfo}>
            <Text variant="titleSmall" style={styles.dmName} numberOfLines={1}>
              {item.other_username || `Thread ${item.id}`}
            </Text>
            {item.other_user_status_quote ? (
              <Text variant="bodySmall" style={styles.dmStatus} numberOfLines={1}>
                {item.other_user_status_quote}
              </Text>
            ) : null}
          </View>
          {item.other_user_online && <View style={styles.onlineDot} />}
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
  dmStatus: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#57F287',
    marginLeft: 8,
  },
  empty: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 40,
  },
})
