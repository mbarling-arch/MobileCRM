const colorSchemes = skin => {
  return {
    light: {
      palette: {
        primary: {
          main: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
          lighterOpacity: 'rgb(37 99 235 / 0.08)',
          lightOpacity: 'rgb(37 99 235 / 0.16)',
          mainOpacity: 'rgb(37 99 235 / 0.24)',
          darkOpacity: 'rgb(37 99 235 / 0.32)',
          darkerOpacity: 'rgb(37 99 235 / 0.40)'
        },
        secondary: {
          main: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
          contrastText: '#fff',
          lighterOpacity: 'rgb(100 116 139 / 0.08)',
          lightOpacity: 'rgb(100 116 139 / 0.16)',
          mainOpacity: 'rgb(100 116 139 / 0.24)',
          darkOpacity: 'rgb(100 116 139 / 0.32)',
          darkerOpacity: 'rgb(100 116 139 / 0.40)'
        },
        error: {
          main: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
          contrastText: '#fff',
          lighterOpacity: 'rgb(239 68 68 / 0.08)',
          lightOpacity: 'rgb(239 68 68 / 0.16)',
          mainOpacity: 'rgb(239 68 68 / 0.24)',
          darkOpacity: 'rgb(239 68 68 / 0.32)',
          darkerOpacity: 'rgb(239 68 68 / 0.40)'
        },
        warning: {
          main: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          contrastText: '#fff',
          lighterOpacity: 'rgb(245 158 11 / 0.08)',
          lightOpacity: 'rgb(245 158 11 / 0.16)',
          mainOpacity: 'rgb(245 158 11 / 0.24)',
          darkOpacity: 'rgb(245 158 11 / 0.32)',
          darkerOpacity: 'rgb(245 158 11 / 0.40)'
        },
        info: {
          main: '#0EA5E9',
          light: '#38BDF8',
          dark: '#0284C7',
          contrastText: '#fff',
          lighterOpacity: 'rgb(14 165 233 / 0.08)',
          lightOpacity: 'rgb(14 165 233 / 0.16)',
          mainOpacity: 'rgb(14 165 233 / 0.24)',
          darkOpacity: 'rgb(14 165 233 / 0.32)',
          darkerOpacity: 'rgb(14 165 233 / 0.40)'
        },
        success: {
          main: '#10B981',
          light: '#34D399',
          dark: '#059669',
          contrastText: '#fff',
          lighterOpacity: 'rgb(16 185 129 / 0.08)',
          lightOpacity: 'rgb(16 185 129 / 0.16)',
          mainOpacity: 'rgb(16 185 129 / 0.24)',
          darkOpacity: 'rgb(16 185 129 / 0.32)',
          darkerOpacity: 'rgb(16 185 129 / 0.40)'
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          disabled: '#94A3B8'
        },
        divider: '#E2E8F0',
        background: {
          default: skin === 'bordered' ? '#FFFFFF' : '#F1F5F9',
          paper: '#FFFFFF'
        },
        action: {
          active: '#64748B',
          hover: 'rgba(37, 99, 235, 0.04)',
          selected: 'rgba(37, 99, 235, 0.08)',
          disabled: '#CBD5E1',
          disabledBackground: '#F1F5F9',
          focus: 'rgba(37, 99, 235, 0.12)'
        },
        customColors: {
          bodyBg: '#F1F5F9',
          chatBg: '#E2E8F0',
          greyLightBg: '#F8FAFC',
          inputBorder: '#CBD5E1',
          tableHeaderBg: '#F8FAFC',
          tooltipText: '#FFFFFF',
          trackBg: '#CBD5E1'
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


