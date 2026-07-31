'use client'

import { Card, Col, Row, Skeleton } from 'antd'

// La API en Hobby cold-starts ~3s por request tras estar inactiva — esta
// pantalla evita que el nav se sienta trabado mientras esa request corre.
export default function AdminLoading() {
  return (
    <>
      <Skeleton.Input active size="large" style={{ width: 220, height: 28 }} />
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Col xs={12} md={8} key={i}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
