import { useState, useCallback } from 'react'
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Surface } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import { colors } from '../theme'
import Avatar from '../components/Avatar'

export default function DMChatScreen({ route }) {
  const {
    dmMessages,
    activeDM,
    sendDMMessage,
    hasMoreDMMessages,
    fetchDMMessages,
  } = useChatStore()
  const me = useAuthStore((s) => s.me)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim() || !activeDM) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      await sendDMMessage(activeDM.id, content)
    } catch {}
    setSending(false)
  }

  const loadMore = () => {
    if (!hasMoreDMMessages || !activeDM || dmMessages.length === 0) return
    const oldest = dmMessages[dmMessages.length - 1]
    fetchDMMessages(activeDM.id, oldest.id)
  }

  // Build user lookup from the DM's flat fields + current user
  const userMap = {}
  if (activeDM) {
    if (activeDM.other_user_id) {
      userMap[activeDM.other_user_id] = {
        id: activeDM.other_user_id,
        username: activeDM.other_username,
        avatar_url: activeDM.other_avatar_url,
      }
    }
    if (me) {
      userMap[me.id] = me
    }
  }

  const renderMessage = useCallback(
    ({ item }) => {
      const author = userMap[item.author_id] || {}
      const time = formatTime(item.created_at)
      return (
        <View style={styles.msgRow}>
          <Avatar user={author} size={36} />
          <View style={styles.msgContent}>
            <View style={styles.msgHeader}>
              <Text style={styles.msgAuthor} numberOfLines={1}>
                {author.username || `User ${item.author_id}`}
              </Text>
              <Text style={styles.msgTime}>{time}</Text>
            </View>
            <Text style={styles.msgText}>{item.content}</Text>
          </View>
        </View>
      )
    },
    [activeDM, me],
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={dmMessages}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderMessage}
        inverted
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.msgList}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>Start of conversation</Text>
          </View>
        }
      />

      <Surface style={styles.composer} elevation={2}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message @${route.params?.dmName || 'user'}`}
          placeholderTextColor={colors.onSurfaceVariant}
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          multiline
          maxLength={5000}
          dense
          right={
            <TextInput.Icon
              icon="send"
              iconColor={text.trim() ? colors.primary : colors.onSurfaceVariant}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            />
          }
        />
      </Surface>
    </KeyboardAvoidingView>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const time = `${h}:${m}`
  if (d.toDateString() === now.toDateString()) return `Today at ${time}`
  return `${d.getDate()}/${d.getMonth() + 1} ${time}`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  msgList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  msgContent: {
    flex: 1,
    marginLeft: 10,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  msgAuthor: {
    color: colors.onSurface,
    fontWeight: '600',
    fontSize: 15,
  },
  msgTime: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  msgText: {
    color: colors.onSurface,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  composer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outline,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    maxHeight: 120,
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 22,
    borderColor: colors.outline,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 40,
    transform: [{ scaleY: -1 }],
  },
  empty: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
  },
})
