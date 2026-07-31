'use client'

import type { ReactNode } from 'react'
import { Card } from 'antd'

export function AdminCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Card size="small" title={title}>
      {children}
    </Card>
  )
}
