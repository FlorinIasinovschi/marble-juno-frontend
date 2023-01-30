import React from 'react'
import { AppLayout } from 'components/Layout/AppLayout'
import Quests from 'features/quest'

export default function Home() {
  return (
    <AppLayout fullWidth={true}>
      <Quests />
    </AppLayout>
  )
}
