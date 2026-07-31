'use client'

import type { ReactNode } from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { adminTheme } from './theme'

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm, ...adminTheme }}>{children}</ConfigProvider>
    </AntdRegistry>
  )
}
