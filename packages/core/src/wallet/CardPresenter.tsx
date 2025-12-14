import React from 'react'
import type { WalletCredentialCardData } from './ui-types'
import Card10Pure from '../components/misc/Card10Pure'
import Card11Pure from '../components/misc/Card11Pure'

type Props = {
  data: WalletCredentialCardData
  onPress?: () => void
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  elevated?: boolean
}

const WalletCredentialCard: React.FC<Props> = (props) => {
  return props.data.brandingType === 'Branding10' ? <Card11Pure {...props} /> : <Card10Pure {...props} />
}

export default WalletCredentialCard
