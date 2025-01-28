import { CredentialExchangeRecord, W3cCredentialRecord } from '@credo-ts/core'
import { Attribute, BrandingOverlayType, CredentialOverlay, Predicate } from '@hyperledger/aries-oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { ViewStyle } from 'react-native'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11, { CredentialErrors } from './CredentialCard11'
import { GenericCredentialExchangeRecord } from '../../types/credentials'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'

interface CredentialCardProps {
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

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  credDefId,
  schemaId,
  proof,
  displayItems,
  credName,
  hasAltCredentials,
  handleAltCredChange,
  style = {},
  onPress = undefined,
  credentialErrors,
  brandingOverlay,
}) => {
  // add ability to reference credential by ID, allows us to get past react hook restrictions
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])
  const { ColorPallet } = useTheme()
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({})
  const { resolveBundleForCredential } = useOpenIDCredentials()

  useEffect(() => {
    if (brandingOverlay) {
      setOverlay(brandingOverlay as unknown as CredentialOverlay<BrandingOverlay>)
      return
    }

    const resolveOverlay = async (w3cCred: W3cCredentialRecord) => {
      const brandingOverlay = await resolveBundleForCredential(w3cCred)
      setOverlay(brandingOverlay)
    }

    if (credential instanceof W3cCredentialRecord) {
      resolveOverlay(credential)
    }
  }, [credential, brandingOverlay, resolveBundleForCredential])

  const getCredOverlayType = (type: BrandingOverlayType) => {
    if (proof) {
      return (
        <CredentialCard11
          displayItems={displayItems}
          style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}
          credName={credName}
          credDefId={credDefId}
          schemaId={schemaId}
          credential={credential as CredentialExchangeRecord}
          handleAltCredChange={handleAltCredChange}
          hasAltCredentials={hasAltCredentials}
          proof
          elevated
          credentialErrors={credentialErrors ?? []}
        />
      )
    }

    if (credential) {
      if (type === BrandingOverlayType.Branding01) {
        return <CredentialCard10 credential={credential as CredentialExchangeRecord} style={style} onPress={onPress} />
      } else {
        return (
          <CredentialCard11
            credential={credential as CredentialExchangeRecord}
            style={style}
            onPress={onPress}
            credentialErrors={credentialErrors ?? []}
          />
        )
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
          credentialErrors={credentialErrors ?? []}
        />
      )
    }
  }

  if (credential instanceof W3cCredentialRecord) {
    return (
      <CredentialCard11
        credential={undefined}
        style={style}
        onPress={onPress}
        brandingOverlay={overlay}
        credentialErrors={credentialErrors ?? []}
        proof={proof}
        elevated={proof}
        displayItems={displayItems}
        hideSlice={true}
      />
    )
  } else {
    return getCredOverlayType(bundleResolver.getBrandingOverlayType())
  }
}

export default CredentialCard
