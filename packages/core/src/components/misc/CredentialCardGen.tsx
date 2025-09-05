// packages/core/src/components/misc/CredentialCard.tsx
import React, { useEffect, useMemo, useState } from 'react'
import type { ViewStyle } from 'react-native'
import { CredentialExchangeRecord, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay } from '@bifold/oca'
import { Attribute, BrandingOverlayType, CredentialOverlay, Predicate } from '@bifold/oca/build/legacy'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import type { GenericFn } from '../../types/fn'
import type { GenericCredentialExchangeRecord } from '../../types/credentials'

// unified wallet-model imports
import WalletCredentialCard from '../../wallet/CardPresenter'
import type { AnonCredsBundleLite, BrandingType, W3CInput, WalletCredentialCardData } from '../../wallet/ui-types'
import { mapAnonCredsToCard, mapW3CToCard } from '../../wallet/map-to-card'

// helpers used only at mapping time
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'
import { getCredentialIdentifiers } from '../../utils/credential'
import { useTranslation } from 'react-i18next'
import { useCredentialConnectionLabel } from '../../utils/helpers'
import { CredentialErrors } from './CredentialCard11'

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
  const { i18n, t } = useTranslation()

  const { resolveBundleForCredential } = useOpenIDCredentials()
  const credentialConnectionLabel = useCredentialConnectionLabel(credential as CredentialExchangeRecord)

  // unified card data
  const [cardData, setCardData] = useState<WalletCredentialCardData | undefined>(undefined)

  const isRevoked = !!credentialErrors?.includes(CredentialErrors.Revoked)
  const notInWallet = !!credentialErrors?.includes(CredentialErrors.NotInWallet)

  // Map resolver enum → string our presenter understands
  const brandingTypeString = useMemo<BrandingType>(() => {
    const t = bundleResolver.getBrandingOverlayType()
    switch (t) {
      case BrandingOverlayType.Branding01:
        return 'Branding01'
      case BrandingOverlayType.Branding10:
        return 'Branding10'
      case BrandingOverlayType.Branding11:
        return 'Branding11'
    }
  }, [bundleResolver])

  // ---- W3C / SD-JWT VC / mDL path ----
  useEffect(() => {
    const resolveOverlay = async (w3cCred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => {
      const bo = brandingOverlay ?? (await resolveBundleForCredential(w3cCred))

      // Extract a VC-shaped object (provider differences handled loosely)
      const vc = (w3cCred as any).credential ?? (w3cCred as any).data ?? {}

      const input = {
        vc: {
          issuer: vc.issuer,
          type: vc.type,
          credentialSubject: vc.credentialSubject,
          name: vc.name,
        },
        branding: {
          type: brandingTypeString,
          primaryBg: bo?.brandingOverlay?.primaryBackgroundColor,
          secondaryBg: bo?.brandingOverlay?.secondaryBackgroundColor,
          logo1x1Uri: bo?.brandingOverlay?.logo,
          backgroundSliceUri: bo?.brandingOverlay?.backgroundImageSlice,
          backgroundFullUri: bo?.brandingOverlay?.backgroundImage,
          preferredTextColor: undefined,
          watermark: bo?.metaOverlay?.watermark,
        },
        labels: bo?.bundle?.labelOverlay?.attributeLabels,
        helpActionUrl:
          (bo as any)?.bundle?.bundle?.metadata?.issuerUrl?.en ??
          (bo as any)?.bundle?.bundle?.metadata?.issuerUrl?.['en-US'] ??
          undefined,
      } as W3CInput

      const w3cId = (w3cCred as any).id ?? (w3cCred as any).threadId ?? (vc?.id as string) ?? `${Date.now()}`

      setCardData(mapW3CToCard(input, w3cId))
    }

    if (
      credential instanceof W3cCredentialRecord ||
      credential instanceof SdJwtVcRecord ||
      credential instanceof MdocRecord
    ) {
      resolveOverlay(credential)
    }
  }, [credential, resolveBundleForCredential, brandingTypeString, brandingOverlay])

  // ---- AnonCreds (CredentialExchangeRecord) path ----
  useEffect(() => {
    const run = async (rec: CredentialExchangeRecord) => {
      const params: any = {
        identifiers: getCredentialIdentifiers(rec),
        attributes: proof ? [] : rec.credentialAttributes,
        meta: {
          credName,
          credConnectionId: rec?.connectionId,
          alias: credentialConnectionLabel,
        },
        language: i18n.language,
      }
      const overlay: CredentialOverlay<BrandingOverlay | BaseOverlay | LegacyBrandingOverlay> =
        await bundleResolver.resolveAllBundles(params)

      const bundleLite = {
        labels: overlay?.bundle?.labelOverlay?.attributeLabels,
        formats: Object.fromEntries(((overlay.bundle as any)?.attributes ?? []).map((a: any) => [a.name, a.format])),
        flaggedPII: (overlay as any).bundle.bundle.flaggedAttributes?.map((a: any) => a.name),
        primaryAttributeKey: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.primaryAttribute,
        secondaryAttributeKey: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.secondaryAttribute,
        issuer: overlay?.metaOverlay?.issuer,
        name: overlay?.metaOverlay?.name,
        watermark: overlay?.metaOverlay?.watermark,
        helpActionUrl:
          (overlay as any)?.bundle?.bundle?.metadata?.issuerUrl?.en ??
          Object.values((overlay as any)?.bundle?.bundle?.metadata?.issuerUrl ?? {})?.[0],
        branding: {
          type: brandingTypeString,
          primaryBg:
            (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.primaryBackgroundColor ??
            ColorPalette.grayscale.lightGrey,
          secondaryBg: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.secondaryBackgroundColor,
          logo1x1Uri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.logo,
          logoText:
            overlay.metaOverlay?.issuer && overlay.metaOverlay?.issuer !== 'Unknown Contact'
              ? overlay.metaOverlay?.issuer
              : t('Contacts.UnknownContact'),
          backgroundSliceUri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.backgroundImageSlice,
          backgroundFullUri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.backgroundImage,
          preferredTextColor: undefined,
        },
      } as AnonCredsBundleLite

      const data = mapAnonCredsToCard(rec, bundleLite as any, {
        proofContext: !!proof,
        revoked: isRevoked,
        notInWallet,
        connectionLabel: undefined,
        displayItems: proof ? displayItems : undefined,
      })
      setCardData(data)
    }

    if (credential instanceof CredentialExchangeRecord) {
      run(credential)
    }
  }, [
    credential,
    bundleResolver,
    proof,
    isRevoked,
    notInWallet,
    credName,
    brandingTypeString,
    i18n.language,
    credentialConnectionLabel,
    ColorPalette,
    t,
    displayItems,
  ])

  // ---- Pre-supplied overlay (brandingOverlay prop) → W3C-like mapping ----
  //   useEffect(() => {
  //     if (!brandingOverlay) return
  //     const bo = brandingOverlay

  //     const input = {
  //       vc: {
  //         issuer: undefined,
  //         type: undefined,
  //         credentialSubject: undefined,
  //         name: undefined,
  //       },
  //       branding: {
  //         type: brandingTypeString,
  //         primaryBg: bo?.brandingOverlay?.primaryBackgroundColor,
  //         secondaryBg: bo?.brandingOverlay?.secondaryBackgroundColor,
  //         logo1x1Uri: bo?.brandingOverlay?.logo,
  //         backgroundSliceUri: bo?.brandingOverlay?.backgroundImageSlice,
  //         backgroundFullUri: bo?.brandingOverlay?.backgroundImage,
  //         preferredTextColor: undefined,
  //         watermark: bo?.metaOverlay?.watermark,
  //       },
  //       labels: bo?.labelOverlay?.attributeLabels,
  //       formats: Object.fromEntries((bo?.bundle?.attributes ?? []).map((a: any) => [a.name, a.format])),
  //       piiKeys: bo?.bundle?.bundle?.flaggedAttributes?.map((a: any) => a.name),
  //       helpActionUrl:
  //         (bo as any)?.bundle?.bundle?.metadata?.issuerUrl?.en ??
  //         (bo as any)?.bundle?.bundle?.metadata?.issuerUrl?.['en-US'] ??
  //         undefined,
  //     }
  //     setCardData(mapW3CToCard(input as any, `overlay-${Date.now()}`))
  //   }, [brandingOverlay, brandingTypeString])

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
            brandingType: brandingTypeString,
          } as any
        }
        onPress={onPress}
        hasAltCredentials={hasAltCredentials}
        onChangeAlt={handleAltCredChange}
        elevated={!!proof}
        hideSlice={!!proof}
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
      hideSlice={!!proof}
    />
  )
}

export default CredentialCardGen
