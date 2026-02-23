import { useState } from 'react'
import { View, StyleSheet, ScrollView, Image } from 'react-native'
import { Text, Button, TextInput, Surface, Divider } from 'react-native-paper'
import { useAuthStore } from '../stores/auth'
import { api } from '../api/client'
import { colors } from '../theme'
import Avatar from '../components/Avatar'

export default function ProfileScreen() {
  const { me, logout } = useAuthStore()
  const [bio, setBio] = useState(me?.bio || '')
  const [statusQuote, setStatusQuote] = useState(me?.status_quote || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api('/me', {
        method: 'PATCH',
        body: { bio, status_quote: statusQuote },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Surface style={styles.card} elevation={1}>
        {me?.profile_background_url ? (
          <Image
            source={{ uri: me.profile_background_url }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.backgroundPlaceholder} />
        )}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Avatar user={me} size={64} />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="titleLarge" style={styles.username}>
              {me?.username}
            </Text>
            <Text variant="bodySmall" style={styles.email}>
              {me?.email}
            </Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          Status Quote
        </Text>
        <TextInput
          value={statusQuote}
          onChangeText={setStatusQuote}
          mode="outlined"
          placeholder="What's on your mind?"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          maxLength={128}
        />

        <Text variant="titleSmall" style={[styles.sectionTitle, { marginTop: 16 }]}>
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          mode="outlined"
          placeholder="Tell us about yourself"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: 4 }}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </Surface>

      <Divider style={styles.divider} />

      <Button
        mode="outlined"
        onPress={logout}
        textColor={colors.error}
        style={styles.logoutBtn}
        icon="logout"
      >
        Log Out
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: 120,
  },
  backgroundPlaceholder: {
    width: '100%',
    height: 60,
    backgroundColor: colors.primary + '40',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -32,
  },
  avatarWrap: {
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
    marginTop: 32,
  },
  username: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  email: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    fontSize: 15,
    marginHorizontal: 20,
  },
  inputOutline: {
    borderRadius: 14,
    borderColor: colors.outline,
  },
  saveBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  divider: {
    backgroundColor: colors.outline,
    marginVertical: 4,
  },
  logoutBtn: {
    borderRadius: 20,
    borderColor: colors.error,
  },
})
