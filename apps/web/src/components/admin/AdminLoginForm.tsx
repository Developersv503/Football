'use client'

import { useActionState } from 'react'
import { LockOutlined, MailOutlined, SafetyCertificateFilled } from '@ant-design/icons'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { adminLoginAction, type FormState } from '@/lib/admin-actions'

const initialState: FormState = { error: null }

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState)

  return (
    <>
      <div className="admin-login-mark">
        <SafetyCertificateFilled style={{ fontSize: 22, color: '#04222C' }} />
      </div>
      <Typography.Title level={3} style={{ margin: '0 0 4px', color: 'var(--adm-text)' }}>
        Panel administrativo
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12.5, marginBottom: 24 }}>
        Acceso exclusivo del dueño — cuentas de usuario normales no entran acá.
      </Typography.Paragraph>
      <Form action={formAction} layout="vertical" requiredMark={false} className="admin-login-form">
      <Form.Item label="Email" required style={{ textAlign: 'left' }}>
        <Input name="email" type="email" prefix={<MailOutlined style={{ color: '#7A8AA0' }} />} autoComplete="email" required size="large" />
      </Form.Item>
      <Form.Item label="Contraseña" required style={{ textAlign: 'left' }}>
        <Input.Password name="password" prefix={<LockOutlined style={{ color: '#7A8AA0' }} />} autoComplete="current-password" required size="large" />
      </Form.Item>
      {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 16, textAlign: 'left' }} /> : null}
      <Button type="primary" htmlType="submit" loading={pending} block size="large">
        {pending ? 'Ingresando…' : 'Ingresar al panel'}
      </Button>
      </Form>
    </>
  )
}
