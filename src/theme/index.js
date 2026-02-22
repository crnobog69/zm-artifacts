import { MD3DarkTheme } from 'react-native-paper'

const colors = {
  // Discord-mobile inspired dark palette
  primary: '#5865F2',         // Discord blurple
  primaryContainer: '#4752C4',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#E0E3FF',

  secondary: '#57F287',       // Discord green
  secondaryContainer: '#248046',
  onSecondary: '#003300',
  onSecondaryContainer: '#C3FCD4',

  tertiary: '#EB459E',        // Discord fuchsia
  tertiaryContainer: '#AD1457',

  background: '#111214',      // Very dark
  onBackground: '#DBDEE1',
  surface: '#1E1F22',         // Card / panel bg
  onSurface: '#F2F3F5',
  surfaceVariant: '#2B2D31',  // Slightly lighter panels
  onSurfaceVariant: '#B5BAC1',
  surfaceDisabled: '#2B2D31',

  outline: '#3F4147',
  outlineVariant: '#2B2D31',

  error: '#ED4245',           // Discord red
  errorContainer: '#5C1F1F',
  onError: '#FFFFFF',
  onErrorContainer: '#F5B3B4',

  inverseSurface: '#F2F3F5',
  inverseOnSurface: '#1E1F22',
  inversePrimary: '#3A45A8',

  elevation: {
    level0: 'transparent',
    level1: '#1E1F22',
    level2: '#232428',
    level3: '#2B2D31',
    level4: '#2E3035',
    level5: '#35373C',
  },
}

export const theme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    ...colors,
  },
}

export { colors }
