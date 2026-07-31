import type { ThemeConfig } from 'antd'

// Mismos tokens que admin.css (paleta fría "consola de control"), mapeados
// al sistema de theming de antd para que sus componentes calcen con el resto
// del panel sin CSS custom por-componente.
export const adminTheme: ThemeConfig = {
  hashed: false,
  token: {
    colorPrimary: '#4CC9F0',
    colorInfo: '#4CC9F0',
    colorSuccess: '#34B378',
    colorWarning: '#F5A623',
    colorError: '#E14B4B',
    colorBgBase: '#090C12',
    colorBgContainer: '#0F141D',
    colorBgElevated: '#151C28',
    colorBgLayout: '#090C12',
    colorBorder: '#232E40',
    colorBorderSecondary: '#1B2433',
    colorText: '#DCE4F0',
    colorTextSecondary: '#9AA8BC',
    colorTextTertiary: '#7A8AA0',
    colorTextQuaternary: '#4E5C71',
    fontFamily: "'Plex Sans', 'Segoe UI', sans-serif",
    fontFamilyCode: "'Plex Mono', monospace",
    borderRadius: 8,
    borderRadiusLG: 12,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#0F141D',
      headerBg: '#0F141D',
      bodyBg: '#090C12',
    },
    Menu: {
      darkItemBg: '#0F141D',
      darkSubMenuItemBg: '#0F141D',
      darkItemSelectedBg: 'rgba(76, 201, 240, 0.14)',
      darkItemSelectedColor: '#7DDBFA',
      darkItemColor: '#9AA8BC',
      darkItemHoverColor: '#DCE4F0',
      itemBorderRadius: 8,
      itemHeight: 44,
    },
    Table: {
      headerBg: '#151C28',
      headerColor: '#7A8AA0',
      rowHoverBg: '#151C28',
      borderColor: '#232E40',
    },
    Card: {
      colorBgContainer: '#0F141D',
    },
    Statistic: {
      contentFontSize: 26,
    },
    Button: {
      primaryShadow: 'none',
      fontWeight: 600,
    },
  },
}
