import React from 'react'
import { AppLayout } from 'components/Layout/AppLayout'
import Loyalty from 'features/loyalty'

export default function Home() {
  return (
    <AppLayout fullWidth={true}>
      <Loyalty />
    </AppLayout>
  )
}
