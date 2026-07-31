'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { adminThemeDark, adminThemeLight } from './theme'

type AdminThemeMode = 'dark' | 'light'

const AdminThemeModeContext = createContext<{ mode: AdminThemeMode; toggle: () => void }>({
  mode: 'dark',
  toggle: () => {},
})

export function useAdminThemeMode() {
  return useContext(AdminThemeModeContext)
}

const STORAGE_KEY = 'admin-theme'

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AdminThemeMode>('dark')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') setMode(saved)
  }, [])

  function toggle() {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <div data-theme={mode} className="admin-theme-root">
      <AntdRegistry>
        <ConfigProvider
          theme={{
            algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            ...(mode === 'dark' ? adminThemeDark : adminThemeLight),
          }}
        >
          <AdminThemeModeContext.Provider value={{ mode, toggle }}>{children}</AdminThemeModeContext.Provider>
        </ConfigProvider>
      </AntdRegistry>
    </div>
  )
}
