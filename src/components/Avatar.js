import { Avatar as PaperAvatar } from 'react-native-paper'
import { colors } from '../theme'

export default function Avatar({ user, size = 40, style }) {
  if (user?.avatar_url) {
    return <PaperAvatar.Image size={size} source={{ uri: user.avatar_url }} style={style} />
  }

  const label = (user?.username || '?').slice(0, 2).toUpperCase()
  return (
    <PaperAvatar.Text
      size={size}
      label={label}
      style={[{ backgroundColor: colors.primary }, style]}
      labelStyle={{ fontSize: size * 0.4 }}
    />
  )
}
