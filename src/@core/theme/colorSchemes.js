const colorSchemes = skin => {
  return {
    light: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',
          lighterOpacity: 'rgb(140 87 255 / 0.08)',
          lightOpacity: 'rgb(140 87 255 / 0.16)',
          mainOpacity: 'rgb(140 87 255 / 0.24)',
          darkOpacity: 'rgb(140 87 255 / 0.32)',
          darkerOpacity: 'rgb(140 87 255 / 0.38)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          contrastText: '#fff',
          lighterOpacity: 'rgb(138 141 147 / 0.08)',
          lightOpacity: 'rgb(138 141 147 / 0.16)',
          mainOpacity: 'rgb(138 141 147 / 0.24)',
          darkOpacity: 'rgb(138 141 147 / 0.32)',
          darkerOpacity: 'rgb(138 141 147 / 0.38)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          contrastText: '#fff',
          lighterOpacity: 'rgb(255 76 81 / 0.08)',
          lightOpacity: 'rgb(255 76 81 / 0.16)',
          mainOpacity: 'rgb(255 76 81 / 0.24)',
          darkOpacity: 'rgb(255 76 81 / 0.32)',
          darkerOpacity: 'rgb(255 76 81 / 0.38)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          contrastText: '#fff',
          lighterOpacity: 'rgb(255 180 0 / 0.08)',
          lightOpacity: 'rgb(255 180 0 / 0.16)',
          mainOpacity: 'rgb(255 180 0 / 0.24)',
          darkOpacity: 'rgb(255 180 0 / 0.32)',
          darkerOpacity: 'rgb(255 180 0 / 0.38)'
        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          contrastText: '#fff',
          lighterOpacity: 'rgb(22 177 255 / 0.08)',
          lightOpacity: 'rgb(22 177 255 / 0.16)',
          mainOpacity: 'rgb(22 177 255 / 0.24)',
          darkOpacity: 'rgb(22 177 255 / 0.32)',
          darkerOpacity: 'rgb(22 177 255 / 0.38)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          contrastText: '#fff',
          lighterOpacity: 'rgb(86 202 0 / 0.08)',
          lightOpacity: 'rgb(86 202 0 / 0.16)',
          mainOpacity: 'rgb(86 202 0 / 0.24)',
          darkOpacity: 'rgb(86 202 0 / 0.32)',
          darkerOpacity: 'rgb(86 202 0 / 0.38)'
        },
        text: {
          primary: 'rgba(46, 38, 61, 0.95)',
          secondary: 'rgba(46, 38, 61, 0.75)',
          disabled: 'rgba(46, 38, 61, 0.45)'
        },
        divider: 'rgba(46, 38, 61, 0.2)',
        background: {
          default: skin === 'bordered' ? '#FFFFFF' : '#F4F5FA',
          paper: '#FFFFFF'
        },
        action: {
          active: 'rgba(46, 38, 61, 0.6)',
          hover: 'rgba(46, 38, 61, 0.08)',
          selected: 'rgba(140, 87, 255, 0.12)',
          disabled: 'rgba(46, 38, 61, 0.3)',
          disabledBackground: 'rgba(46, 38, 61, 0.12)',
          focus: 'rgba(46, 38, 61, 0.1)'
        },
        customColors: {
          bodyBg: '#F4F5FA',
          chatBg: '#F7F6FA',
          greyLightBg: '#FAFAFA',
          inputBorder: 'rgba(46, 38, 61, 0.3)',
          tableHeaderBg: '#F9FAFB',
          tooltipText: '#FFFFFF',
          trackBg: '#E8EAED'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',
          lighterOpacity: 'rgb(140 87 255 / 0.08)',
          lightOpacity: 'rgb(140 87 255 / 0.16)',
          mainOpacity: 'rgb(140 87 255 / 0.24)',
          darkOpacity: 'rgb(140 87 255 / 0.32)',
          darkerOpacity: 'rgb(140 87 255 / 0.38)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          contrastText: '#fff',
          lighterOpacity: 'rgb(138 141 147 / 0.08)',
          lightOpacity: 'rgb(138 141 147 / 0.16)',
          mainOpacity: 'rgb(138 141 147 / 0.24)',
          darkOpacity: 'rgb(138 141 147 / 0.32)',
          darkerOpacity: 'rgb(138 141 147 / 0.38)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          contrastText: '#fff',
          lighterOpacity: 'rgb(255 76 81 / 0.08)',
          lightOpacity: 'rgb(255 76 81 / 0.16)',
          mainOpacity: 'rgb(255 76 81 / 0.24)',
          darkOpacity: 'rgb(255 76 81 / 0.32)',
          darkerOpacity: 'rgb(255 76 81 / 0.38)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          contrastText: '#fff',
          lighterOpacity: 'rgb(255 180 0 / 0.08)',
          lightOpacity: 'rgb(255 180 0 / 0.16)',
          mainOpacity: 'rgb(255 180 0 / 0.24)',
          darkOpacity: 'rgb(255 180 0 / 0.32)',
          darkerOpacity: 'rgb(255 180 0 / 0.38)'
        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          contrastText: '#fff',
          lighterOpacity: 'rgb(22 177 255 / 0.08)',
          lightOpacity: 'rgb(22 177 255 / 0.16)',
          mainOpacity: 'rgb(22 177 255 / 0.24)',
          darkOpacity: 'rgb(22 177 255 / 0.32)',
          darkerOpacity: 'rgb(22 177 255 / 0.38)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          contrastText: '#fff',
          lighterOpacity: 'rgb(86 202 0 / 0.08)',
          lightOpacity: 'rgb(86 202 0 / 0.16)',
          mainOpacity: 'rgb(86 202 0 / 0.24)',
          darkOpacity: 'rgb(86 202 0 / 0.32)',
          darkerOpacity: 'rgb(86 202 0 / 0.38)'
        },
        text: {
          primary: 'rgba(231, 227, 252, 0.9)',
          secondary: 'rgba(231, 227, 252, 0.7)',
          disabled: 'rgba(231, 227, 252, 0.4)'
        },
        divider: 'rgba(231, 227, 252, 0.12)',
        background: {
          default: skin === 'bordered' ? '#312D4B' : '#28243D',
          paper: '#312D4B'
        },
        action: {
          active: 'rgba(231, 227, 252, 0.6)',
          hover: 'rgba(231, 227, 252, 0.04)',
          selected: 'rgba(231, 227, 252, 0.08)',
          disabled: 'rgba(231, 227, 252, 0.3)',
          disabledBackground: 'rgba(231, 227, 252, 0.12)',
          focus: 'rgba(231, 227, 252, 0.1)'
        },
        customColors: {
          bodyBg: '#28243D',
          chatBg: '#373452',
          greyLightBg: '#373350',
          inputBorder: 'rgba(231, 227, 252, 0.22)',
          tableHeaderBg: '#3D3759',
          tooltipText: '#312D4B',
          trackBg: '#474360'
        }
      }
    }
  }
}

export default colorSchemes


