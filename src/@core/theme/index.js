// Theme Module Imports
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'
import overrides from './overrides'

const theme = (settings, mode) => {
  // Settings can include: skin ('default' or 'bordered'), primaryColor, etc.
  const skin = settings?.skin || 'default'

  return {
    colorSchemes: colorSchemes(skin),
    components: overrides(skin),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(),
    customShadows: customShadows(mode),
    // Main color channels for use in rgba() calculations
    mainColorChannels: {
      light: '46 38 61',
      dark: '231 227 252',
      lightShadow: '46 38 61',
      darkShadow: '19 17 32'
    }
  }
}

export default theme

