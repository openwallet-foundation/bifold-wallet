import { CredentialExchangeRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import React from 'react'
import { ViewStyle } from 'react-native'
import { Attribute, Predicate } from '../../types/record'

import { useConfiguration } from '../../contexts/configuration'
import { GenericFn } from '../../types/fn'
import { CardOverlayType } from '../../types/oca'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11 from './CredentialCard11'
import CredentialProofCard from './CredentialProofCard'

interface CredentialCardProps {
  credential?: CredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName?: string
  onPress?: GenericFn
  style?: ViewStyle
  proof?: boolean
  proofAttributes?: Attribute[]
  proofPredicates?: Predicate[]
  existsInWallet?: boolean
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, credDefId, schemaId, proof, proofAttributes, proofPredicates, credName, existsInWallet, style = {}, onPress = undefined }) => {
  // add ability to reference credential by ID, allows us to get past react hook restrictions
  const { OCABundleResolver } = useConfiguration()
  const getCredOverlayType = (type: CardOverlayType) => {
    if (proof) {
      return (<CredentialProofCard credDefId={credDefId} schemaId={schemaId} proofAttributes={proofAttributes ?? []} proofPredicates={proofPredicates ?? []} credName={credName ?? ""} existsInWallet={existsInWallet} />)
    } else if (type === CardOverlayType.CardLayout10) {
      return (<CredentialCard10 credential={credential as CredentialExchangeRecord} style={style} onPress={onPress} />)
    } else {
      return (<CredentialCard11 credential={credential as CredentialExchangeRecord} style={style} onPress={onPress} />)
    }
  }
  return getCredOverlayType(OCABundleResolver.cardOverlayType)
}

export default CredentialCard
