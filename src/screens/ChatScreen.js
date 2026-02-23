import { useState, useRef, useCallback, useEffect } from 'react'
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, IconButton, Surface } from 'react-native-paper'
import { useChatStore } from '../stores/chat'
import { colors } from '../theme'
import Avatar from '../components/Avatar'

export default function ChatScreen({ route }) {
  const {
    messages,
    activeChannel,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    members,
  } = useChatStore()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef(null)

  const handleSend = async () => {
    if (!text.trim() || !activeChannel) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      await sendMessage(activeChannel.id, content)
    } catch {}
    setSending(false)
  }

  const userMap = {}
  for (const m of members || []) {
    userMap[m.user_id || m.id] = m
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
    [members],
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderMessage}
        inverted
        onEndReached={() => {
          if (hasMoreMessages) loadMoreMessages()
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.msgList}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>
              Welcome to #{route.params?.channelName || 'channel'}!
            </Text>
            <Text style={styles.emptySub}>Start the conversation.</Text>
          </View>
        }
      />

      <Surface style={styles.composer} elevation={2}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message #${route.params?.channelName || 'channel'}`}
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
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
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
    // inverted FlatList — so this appears at the "bottom" visually
    transform: [{ scaleY: -1 }],
  },
  empty: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    marginTop: 4,
  },
})
