import { CredentialExchangeRecord } from '@aries-framework/core'
import React from 'react'
import { ViewStyle } from 'react-native'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { CardOverlayType } from '../../types/oca'
import { Attribute, Predicate } from '../../types/record'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11 from './CredentialCard11'

interface CredentialCardProps {
  credential?: CredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName?: string
  onPress?: GenericFn
  style?: ViewStyle
  proof?: boolean
  displayItems?: (Attribute | Predicate)[]
  existsInWallet?: boolean
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  credDefId,
  schemaId,
  proof,
  displayItems,
  credName,
  existsInWallet,
  style = {},
  onPress = undefined,
}) => {
  // add ability to reference credential by ID, allows us to get past react hook restrictions
  const { OCABundleResolver } = useConfiguration()
  const { ColorPallet } = useTheme()
  const getCredOverlayType = (type: CardOverlayType) => {
    if (proof) {
      return (
        <CredentialCard11
          displayItems={displayItems}
          style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}
          error={!existsInWallet}
          credName={credName}
          credDefId={credDefId}
          schemaId={schemaId}
          credential={credential}
          proof
          elevated
        ></CredentialCard11>
      )
    }

    if (credential) {
      if (type === CardOverlayType.CardLayout10) {
        return <CredentialCard10 credential={credential as CredentialExchangeRecord} style={style} onPress={onPress} />
      } else {
        return <CredentialCard11 credential={credential as CredentialExchangeRecord} style={style} onPress={onPress} />
      }
    } else {
      return (
        <CredentialCard11
          credDefId={credDefId}
          schemaId={schemaId}
          credName={credName}
          displayItems={displayItems}
          style={style}
          onPress={onPress}
        />
      )
    }
  }
  return getCredOverlayType(OCABundleResolver.cardOverlayType)
}

export default CredentialCard
