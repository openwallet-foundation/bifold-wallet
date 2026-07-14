import React from 'react'
import type { WalletCredentialCardData } from './ui-types'
import { toWalletCredentialCardViewModel } from './to-card-view-model'
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
  const data = toWalletCredentialCardViewModel(props.data)
  const cardProps = { ...props, data }

  return data.layout === 'card11' ? <Card11Pure {...cardProps} /> : <Card10Pure {...cardProps} />
}

export default WalletCredentialCard
