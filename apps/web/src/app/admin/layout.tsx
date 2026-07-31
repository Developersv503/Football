import type { ReactNode } from 'react'
import { AdminThemeProvider } from './AdminThemeProvider'
import './admin.css'

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>
}
