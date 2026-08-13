import React from 'react'
import type { WalletCredentialCardViewModel } from './card-view-model'
import Card10Pure from '../components/misc/Card10Pure'
import Card11Pure from '../components/misc/Card11Pure'

type Props = {
  data: WalletCredentialCardViewModel
  onPress?: () => void
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  elevated?: boolean
}

const WalletCredentialCard: React.FC<Props> = (props) => {
  return props.data.layout === 'card11' ? <Card11Pure {...props} /> : <Card10Pure {...props} />
}

export default WalletCredentialCard
