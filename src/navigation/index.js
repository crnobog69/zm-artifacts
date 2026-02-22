import { NavigationContainer, DarkTheme as NavDark } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuthStore } from '../stores/auth'
import { colors } from '../theme'
import LoginScreen from '../screens/LoginScreen'
import GuildsScreen from '../screens/GuildsScreen'
import ChannelsScreen from '../screens/ChannelsScreen'
import ChatScreen from '../screens/ChatScreen'
import DMsScreen from '../screens/DMsScreen'
import DMChatScreen from '../screens/DMChatScreen'
import MembersScreen from '../screens/MembersScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const navTheme = {
  ...NavDark,
  colors: {
    ...NavDark.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.outline,
    primary: colors.primary,
  },
}

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.onSurface,
  headerShadowVisible: false,
  animation: 'slide_from_right',
}

function GuildStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="GuildList" component={GuildsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Channels"
        component={ChannelsScreen}
        options={({ route }) => ({ title: route.params?.guildName || 'Channels' })}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: `#${route.params?.channelName || 'chat'}` })}
      />
      <Stack.Screen
        name="Members"
        component={MembersScreen}
        options={{ title: 'Members' }}
      />
    </Stack.Navigator>
  )
}

function DMStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="DMList" component={DMsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="DMChat"
        component={DMChatScreen}
        options={({ route }) => ({ title: `@${route.params?.dmName || 'DM'}` })}
      />
    </Stack.Navigator>
  )
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Servers"
        component={GuildStack}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="server" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="DMs"
        component={DMStack}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="message" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerShadowVisible: false,
          tabBarIcon: ({ color, size }) => <TabIcon name="account" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

// Simple text-based icon to avoid vector-icons native module issues
function TabIcon({ name, color, size }) {
  const icons = {
    server: '\u2302',     // house
    message: '\u2709',    // envelope
    account: '\u263A',    // smiley
  }
  const { Text } = require('react-native')
  return <Text style={{ color, fontSize: size - 4 }}>{icons[name] || '?'}</Text>
}

export default function Navigation() {
  const token = useAuthStore((s) => s.token)

  return (
    <NavigationContainer theme={navTheme}>
      {token ? <HomeTabs /> : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}
