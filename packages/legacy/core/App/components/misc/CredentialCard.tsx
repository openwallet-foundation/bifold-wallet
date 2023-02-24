import { CredentialExchangeRecord } from '@aries-framework/core'
import React from 'react'
import { ViewStyle } from 'react-native'

import { useConfiguration } from '../../contexts/configuration'
import { GenericFn } from '../../types/fn'
import { CardOverlayType } from '../../types/oca'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11 from './CredentialCard11'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { OCABundleResolver } = useConfiguration()

  return OCABundleResolver.cardOverlayType === CardOverlayType.CardLayout10 ? (
    <CredentialCard10 credential={credential} style={style} onPress={onPress} />
  ) : (
    <CredentialCard11 credential={credential} style={style} onPress={onPress} />
  )
}

export default CredentialCard
