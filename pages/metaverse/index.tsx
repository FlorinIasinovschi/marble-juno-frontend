import React from 'react'
import { AppLayout } from 'components/Layout/AppLayout'
import MetaverseComponent from 'features/metaverse'

export default function Metaverse() {
  return (
    <AppLayout fullWidth={true}>
      <MetaverseComponent />
    </AppLayout>
  )
}
