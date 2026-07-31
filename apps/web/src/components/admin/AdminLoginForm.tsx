'use client'

import { useActionState } from 'react'
import { LockOutlined, MailOutlined, SafetyCertificateFilled } from '@ant-design/icons'
import { Alert, Button, Input, Typography } from 'antd'
import { adminLoginAction, type FormState } from '@/lib/admin-actions'

const initialState: FormState = { error: null }

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState)

  return (
    <>
      <div className="admin-login-mark">
        <SafetyCertificateFilled style={{ fontSize: 22, color: 'var(--adm-accent-ink)' }} />
      </div>
      <Typography.Title level={3} style={{ margin: '0 0 4px', color: 'var(--adm-text)' }}>
        Panel administrativo
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12.5, marginBottom: 24 }}>
        Acceso exclusivo del dueño — cuentas de usuario normales no entran acá.
      </Typography.Paragraph>
      {/* form nativo (no antd Form): antd Form intercepta el submit y evita
          que la server action de React 19 (action={formAction}) se dispare. */}
      <form action={formAction} className="admin-login-form">
        <div className="admin-field-label">Email</div>
        <Input
          name="email"
          type="email"
          prefix={<MailOutlined style={{ color: '#7A8AA0' }} />}
          autoComplete="email"
          required
          size="large"
          style={{ marginBottom: 16 }}
        />
        <div className="admin-field-label">Contraseña</div>
        <Input.Password
          name="password"
          prefix={<LockOutlined style={{ color: '#7A8AA0' }} />}
          autoComplete="current-password"
          required
          size="large"
          style={{ marginBottom: 16 }}
        />
        {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 16, textAlign: 'left' }} /> : null}
        <Button type="primary" htmlType="submit" loading={pending} block size="large">
          {pending ? 'Ingresando…' : 'Ingresar al panel'}
        </Button>
      </form>
    </>
  )
}
