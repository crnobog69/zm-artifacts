import { useEffect } from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { colors } from '../theme'
import Avatar from '../components/Avatar'

export default function MembersScreen({ navigation }) {
  const { members, activeGuild, fetchMembers, openDM, setActiveDM } = useChatStore()

  useEffect(() => {
    if (activeGuild) fetchMembers(activeGuild.id)
  }, [activeGuild?.id])

  const handlePress = async (member) => {
    try {
      const dm = await openDM(member.user_id || member.id)
      setActiveDM(dm)
      navigation.navigate('DMs', {
        screen: 'DMChat',
        params: { dmName: member.username },
      })
    } catch {}
  }

  const renderMember = ({ item }) => (
    <Pressable onPress={() => handlePress(item)} android_ripple={{ color: colors.primary + '30' }}>
      <View style={styles.row}>
        <Avatar user={item} size={40} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.username}
          </Text>
          {item.status_quote ? (
            <Text style={styles.status} numberOfLines={1}>
              {item.status_quote}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.dot,
            { backgroundColor: statusColor(item.status) },
          ]}
        />
      </View>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(m) => String(m.user_id || m.id)}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No members</Text>
        }
      />
    </View>
  )
}

function statusColor(status) {
  switch (status) {
    case 'online':
      return '#57F287'
    case 'idle':
      return '#FEE75C'
    case 'dnd':
      return '#ED4245'
    default:
      return '#80848E'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: colors.onSurface,
    fontWeight: '600',
    fontSize: 15,
  },
  status: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    marginTop: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  empty: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 40,
  },
})
