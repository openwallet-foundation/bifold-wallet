// packages/core/src/components/misc/CredentialCard.tsx
import React, { useEffect, useState } from 'react'
import type { ViewStyle } from 'react-native'
import { DidCommCredentialExchangeRecord } from '@credo-ts/didcomm'
import { BrandingOverlay } from '@bifold/oca'
import { Attribute, BrandingOverlayType, CredentialOverlay, Predicate } from '@bifold/oca/build/legacy'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import type { GenericFn } from '../../types/fn'
import type { CredentialErrors, GenericCredentialExchangeRecord } from '../../types/credentials'

// unified wallet-model imports
import WalletCredentialCard from '../../wallet/CardPresenter'
import type { WalletCredentialCardData } from '../../wallet/ui-types'
import { brandingOverlayTypeString, mapCredentialTypeToCard } from '../../wallet/map-to-card'

import { useTranslation } from 'react-i18next'
import { useCredentialConnectionLabel } from '../../utils/helpers'

export interface CredentialCardProps {
  credential?: GenericCredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName?: string
  onPress?: GenericFn
  style?: ViewStyle
  proof?: boolean
  displayItems?: (Attribute | Predicate)[]
  hasAltCredentials?: boolean
  credentialErrors?: CredentialErrors[]
  handleAltCredChange?: () => void
  brandingOverlay?: CredentialOverlay<BrandingOverlay>
}

const CredentialCardGen: React.FC<CredentialCardProps> = ({
  credential,
  proof,
  credName,
  hasAltCredentials,
  handleAltCredChange,
  onPress = undefined,
  credentialErrors,
  brandingOverlay,
  displayItems,
}) => {
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])
  const { ColorPalette } = useTheme()
  const { t } = useTranslation()
  const credentialConnectionLabel = useCredentialConnectionLabel(credential as DidCommCredentialExchangeRecord)

  // unified card data
  const [cardData, setCardData] = useState<WalletCredentialCardData | undefined>(undefined)

  //Generic Mapping
  useEffect(() => {
    const resolveOverlay = async (cred: GenericCredentialExchangeRecord) => {
      const cardData = await mapCredentialTypeToCard({
        credential: cred,
        bundleResolver,
        colorPalette: ColorPalette,
        unknownIssuerName: t('Contacts.UnknownContact'),
        brandingOverlay,
        proof,
        credentialErrors,
        credName,
        credentialConnectionLabel,
        displayItems,
      })
      setCardData(cardData)
    }
    if (credential) {
      resolveOverlay(credential)
    }
  }, [
    credential,
    bundleResolver,
    ColorPalette,
    brandingOverlay,
    proof,
    credentialErrors,
    t,
    credName,
    credentialConnectionLabel,
    displayItems,
  ])

  // ---- Fallback while mapping is in-flight ----
  if (!cardData) {
    const isBranding10 = bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding10
    return (
      <WalletCredentialCard
        data={
          {
            id: 'loading',
            issuerName: '',
            credentialName: credName ?? 'Credential',
            branding: {
              primaryBg: isBranding10 ? ColorPalette.brand.secondaryBackground : undefined,
              secondaryBg: undefined,
            },
            items: [],
            brandingType: brandingOverlayTypeString(bundleResolver.getBrandingOverlayType()),
          } as any
        }
        onPress={onPress}
        hasAltCredentials={hasAltCredentials}
        onChangeAlt={handleAltCredChange}
        elevated={!!proof}
      />
    )
  }

  return (
    <WalletCredentialCard
      data={cardData}
      onPress={onPress}
      hasAltCredentials={hasAltCredentials}
      onChangeAlt={handleAltCredChange}
      elevated={cardData.brandingType === 'Branding10' || !!proof}
    />
  )
}

export default CredentialCardGen
