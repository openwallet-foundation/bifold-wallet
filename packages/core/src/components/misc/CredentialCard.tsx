import { CredentialExchangeRecord, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { Attribute, BrandingOverlayType, CredentialOverlay, Predicate } from '@bifold/oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { ViewStyle } from 'react-native'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11, { CredentialErrors } from './CredentialCard11'
import { GenericCredentialExchangeRecord } from '../../types/credentials'
import { BrandingOverlay } from '@bifold/oca'
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'
import { getCredentialForDisplay } from '../../modules/openid/display'
import { getAttributeField } from '../../utils/oca'
import { getCredentialIdentifiers } from '../../utils/credential'
import { getCredentialName } from '../../utils/cred-def'

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
  const { ColorPalette } = useTheme()
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({})
  const { resolveBundleForCredential } = useOpenIDCredentials()
  const [extraOverlayAttribute, setExtraOverlayAttribute] = useState<Attribute | undefined>()
  const { agent } = useAgent()
  const [resolvedCredDefId, setResolvedCredDefId] = useState<string | undefined>(credDefId)
  const [resolvedSchemaId, setResolvedSchemaId] = useState<string | undefined>(schemaId)
  const [resolvedCredName, setResolvedCredName] = useState<string | undefined>(credName)

  useEffect(() => {
    if (brandingOverlay) {
      setOverlay(brandingOverlay as unknown as CredentialOverlay<BrandingOverlay>)
      return
    }

    const resolveOverlay = async (w3cCred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => {
      const brandingOverlay = await resolveBundleForCredential(w3cCred)
      setOverlay(brandingOverlay)
    }

    if (
      credential instanceof W3cCredentialRecord ||
      credential instanceof SdJwtVcRecord ||
      credential instanceof MdocRecord
    ) {
      resolveOverlay(credential)
      const credentialDisplay = getCredentialForDisplay(credential)
      if (credentialDisplay.display.primary_overlay_attribute) {
        const attributeValue = getAttributeField(
          credentialDisplay,
          credentialDisplay.display.primary_overlay_attribute
        )?.field
        setExtraOverlayAttribute(attributeValue)
      }
    }
  }, [credential, brandingOverlay, resolveBundleForCredential])

  // Resolve identifiers and name (supports webvh via agent) for anoncreds credentials
  useEffect(() => {
    let isMounted = true;
    (async () => {
      // Prefer explicitly provided IDs; otherwise derive from credential
      let nextCredDefId = credDefId
      let nextSchemaId = schemaId

      if (!nextCredDefId || !nextSchemaId) {
        if (credential && credential instanceof CredentialExchangeRecord) {
          const identifiers = getCredentialIdentifiers(credential)
          nextCredDefId = nextCredDefId ?? identifiers.credentialDefinitionId
          nextSchemaId = nextSchemaId ?? identifiers.schemaId
        }
      }

      // Compute name if not provided, using agent-aware helper for webvh and indy
      let nextCredName = credName
      if (!nextCredName) {
        nextCredName = await getCredentialName(nextCredDefId, nextSchemaId, agent)
      }

      if (isMounted) {
        setResolvedCredDefId(nextCredDefId)
        setResolvedSchemaId(nextSchemaId)
        setResolvedCredName(nextCredName)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [credential, credDefId, schemaId, credName, agent])

  const getCredOverlayType = (type: BrandingOverlayType) => {
    const isBranding10 = bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding10
    if (proof) {
      return (
        <CredentialCard11
          displayItems={displayItems}
          style={isBranding10 ? { backgroundColor: ColorPalette.brand.secondaryBackground } : undefined}
          credName={resolvedCredName}
          credDefId={resolvedCredDefId}
          schemaId={resolvedSchemaId}
          credential={credential as CredentialExchangeRecord}
          handleAltCredChange={handleAltCredChange}
          hasAltCredentials={hasAltCredentials}
          proof
          elevated
          credentialErrors={credentialErrors ?? []}
          brandingOverlayType={bundleResolver.getBrandingOverlayType()}
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
            credName={resolvedCredName}
            credDefId={resolvedCredDefId}
            schemaId={resolvedSchemaId}
            onPress={onPress}
            credentialErrors={credentialErrors ?? []}
            brandingOverlayType={bundleResolver.getBrandingOverlayType()}
            elevated={bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding11}
          />
        )
      }
    } else {
      return (
        <CredentialCard11
          credDefId={resolvedCredDefId}
          schemaId={resolvedSchemaId}
          credName={resolvedCredName}
          displayItems={displayItems}
          style={style}
          onPress={onPress}
          credentialErrors={credentialErrors ?? []}
          brandingOverlayType={bundleResolver.getBrandingOverlayType()}
        />
      )
    }
  }

  if (
    credential instanceof W3cCredentialRecord ||
    credential instanceof SdJwtVcRecord ||
    credential instanceof MdocRecord
  ) {
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
        hasAltCredentials={hasAltCredentials}
        handleAltCredChange={handleAltCredChange}
        extraOverlayParameter={extraOverlayAttribute}
        brandingOverlayType={bundleResolver.getBrandingOverlayType()}
      />
    )
  } else {
    return getCredOverlayType(bundleResolver.getBrandingOverlayType())
  }
}

export default CredentialCard
