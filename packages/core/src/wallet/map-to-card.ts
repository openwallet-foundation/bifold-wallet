import { CredentialExchangeRecord, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import startCase from 'lodash.startcase'
import {
  WalletCredentialCardData,
  CardAttribute,
  AttrFormat,
  AnonCredsBundleLite,
  W3CInput,
  MapOpts,
  isPredicate,
} from './ui-types'
import {
  Attribute,
  BrandingOverlayType,
  CredentialOverlay,
  OCABundleResolveAllParams,
  OCABundleResolverType,
  Predicate,
} from '@bifold/oca/build/legacy'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay } from '@bifold/oca'
import { CredentialErrors, GenericCredentialExchangeRecord } from '../types/credentials'
import { getCredentialForDisplay } from '../modules/openid/display'
import { buildFieldsFromW3cCredsCredential, getAttributeField } from '../utils/oca'
import { i18n } from '../localization'
import { getCredentialIdentifiers } from '../utils/credential'
import { IColorPalette } from '../theme'

const isDataUrl = (v: unknown) => typeof v === 'string' && /^data:image\/[a-zA-Z]+;base64,/.test(v)

const fmt = (format: AttrFormat | undefined, value: any) => {
  if (!format) return value
  if ((format === 'date' || format === 'datetime') && value) {
    const d = new Date(value)
    if (Number.isFinite(d.getTime())) return d.toLocaleDateString()
  }
  return value
}

const mapItemToCardAttr = (
  item: Attribute | Predicate,
  labels?: Record<string, string>,
  formats?: Record<string, string | undefined>,
  flaggedPII?: string[]
): CardAttribute => {
  const key = (item as any).name ?? ''
  const rawLabel = (item as any).label ?? key
  const label = labels?.[rawLabel] ?? rawLabel

  let value: string | number | null = (item as any).value ?? null
  let predicate: CardAttribute['predicate'] | undefined

  if (isPredicate(item)) {
    const text = [item.pType, item.pValue].filter(Boolean).join(' ')
    // Prefer explicit value if present (rare), else predicate text
    value = (item as any).value != null ? (item as any).value : text
    predicate = { present: true, satisfied: item.satisfied, text }
  }

  const isPII = !isPredicate(item) ? !!flaggedPII?.includes(rawLabel) : false

  return {
    key,
    label,
    value,
    format: formats?.[key] as any,
    hasError: (item as any).hasError,
    predicate,
    // If CardAttribute in ui-types includes `isPII`, this will be kept;
    // if not, TS will ignore the extra field.
    ...(isPII ? { isPII } : {}),
  }
}

export const brandingOverlayTypeString = (type: BrandingOverlayType) => {
  switch (type) {
    case BrandingOverlayType.Branding01:
      return 'Branding01'
    case BrandingOverlayType.Branding10:
      return 'Branding10'
    case BrandingOverlayType.Branding11:
      return 'Branding11'
  }
}

export function mapAnonCredsToCard(
  rec: CredentialExchangeRecord,
  bundle: AnonCredsBundleLite,
  opts: MapOpts = {}
): WalletCredentialCardData {
  const { proofContext = false, revoked = false, notInWallet = false, displayItems } = opts

  let items: CardAttribute[] = []

  if (proofContext && displayItems?.length) {
    items = displayItems.map((it) => mapItemToCardAttr(it, bundle.labels, bundle.formats, bundle.flaggedPII))
  } else {
    const attrs = rec.credentialAttributes ?? []
    items = attrs.map((a) =>
      mapItemToCardAttr(
        { name: a.name, label: a.name, value: a.value } as unknown as Attribute,
        bundle.labels,
        bundle.formats,
        bundle.flaggedPII
      )
    )

    // Primary/secondary ordering (legacy behavior) — skip in proof mode
    if (bundle.primaryAttributeKey || bundle.secondaryAttributeKey) {
      const byKey = new Map(items.map((i) => [i.key, i]))
      const primary = bundle.primaryAttributeKey ? byKey.get(bundle.primaryAttributeKey) : undefined
      const secondary =
        bundle.secondaryAttributeKey && bundle.secondaryAttributeKey !== bundle.primaryAttributeKey
          ? byKey.get(bundle.secondaryAttributeKey)
          : undefined
      items = [primary, secondary, ...items.filter((i) => i !== primary && i !== secondary)].filter(
        Boolean
      ) as CardAttribute[]
    }
  }

  const status: 'error' | 'warning' | undefined = revoked && !proofContext ? 'error' : undefined
  const allPI = items.length > 0 && items.every((i) => !i.predicate?.present && (i.isPII ?? false))

  return {
    id: (rec as any).id ?? rec.threadId,
    issuerName: bundle.issuer ?? (opts?.connectionLabel || 'Unknown Contact'),
    credentialName: bundle.name ?? 'Credential',
    connectionLabel: opts?.connectionLabel,
    branding: {
      type: bundle.branding.type,
      primaryBg: bundle.branding.primaryBg,
      secondaryBg: bundle.branding.secondaryBg,
      logo1x1Uri: bundle.branding.logo1x1Uri,
      logoText: bundle.branding.logoText,
      backgroundSliceUri: bundle.branding.backgroundSliceUri,
      backgroundFullUri: bundle.branding.backgroundFullUri,
      watermark: bundle.watermark,
      preferredTextColor: bundle.branding.preferredTextColor,
    },
    items,
    primaryAttributeKey: bundle.primaryAttributeKey,
    secondaryAttributeKey: bundle.secondaryAttributeKey,
    brandingType: bundle.branding.type,
    proofContext: proofContext,
    revoked: revoked,
    notInWallet: notInWallet,
    allPI,
    helpActionUrl: bundle.helpActionUrl,
    status,
  }
}

export function mapW3CToCard(input: W3CInput, id: string): WalletCredentialCardData {
  // console.log(' ====> W3C Input:', input)
  const issuerName =
    typeof input.vc.issuer === 'string'
      ? input.vc.issuer
      : input.vc.issuer?.name || input.vc.issuer?.id || 'Unknown Contact'

  const subject = input.vc.credentialSubject ?? {}
  const items: CardAttribute[] = Object.entries(subject).map(([key, raw]) => {
    const label = input.labels?.[key] ?? startCase(key)
    const format = input.formats?.[key]
    const val = typeof raw === 'string' || typeof raw === 'number' ? raw : JSON.stringify(raw)
    const value = isDataUrl(val) ? val : fmt(format, val)
    return {
      key,
      label,
      value,
      format: isDataUrl(val) ? 'image' : format ?? 'text',
      isPII: input.piiKeys?.includes(key) ?? false,
    }
  })

  const allPI = items.length > 0 && items.every((i) => !i.predicate?.present && (i.isPII ?? false))

  return {
    id,
    issuerName,
    credentialName: input.vc.name || (input.vc.type?.[1] ?? 'Credential'),
    branding: {
      type: input.branding.type,
      primaryBg: input.branding.primaryBg,
      secondaryBg: input.branding.secondaryBg,
      logo1x1Uri: input.branding.logo1x1Uri,
      logoText: input.branding.logoText,
      backgroundSliceUri: input.branding.backgroundSliceUri,
      backgroundFullUri: input.branding.backgroundFullUri,
      watermark: input.branding.watermark,
      preferredTextColor: input.branding.preferredTextColor,
    },
    items,
    brandingType: input.branding.type,
    proofContext: false,
    revoked: false,
    notInWallet: false,
    allPI,
    extraOverlayParameter: input.primary_overlay_attribute
      ? mapItemToCardAttr(input.primary_overlay_attribute, input.labels, input.formats, input.piiKeys)
      : undefined,
    helpActionUrl: input.helpActionUrl,
    hideSlice: true,
    status: undefined,
  }
}

/**
 *
 * @param w3cCred
 */

const resolveBundleForW3CCredential = async (
  credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord,
  bundleResolver: OCABundleResolverType
): Promise<CredentialOverlay<BrandingOverlay>> => {
  const credentialDisplay = getCredentialForDisplay(credential)

  const params: OCABundleResolveAllParams = {
    identifiers: {
      schemaId: '',
      credentialDefinitionId: credentialDisplay.id,
    },
    meta: {
      alias: credentialDisplay.display.issuer.name,
      credConnectionId: undefined,
      credName: credentialDisplay.display.name,
    },
    attributes: buildFieldsFromW3cCredsCredential(credentialDisplay),
    language: i18n.language,
  }

  const bundle = await bundleResolver.resolveAllBundles(params)
  const _bundle = bundle as CredentialOverlay<BrandingOverlay>

  const brandingOverlay: BrandingOverlay = new BrandingOverlay('none', {
    capture_base: 'none',
    type: BrandingOverlayType.Branding10,
    primary_background_color: credentialDisplay.display.backgroundColor,
    background_image: credentialDisplay.display.backgroundImage?.url,
    logo: credentialDisplay.display.logo?.url,
  })
  const ocaBundle: CredentialOverlay<BrandingOverlay> = {
    ..._bundle,
    presentationFields: bundle.presentationFields,
    brandingOverlay: brandingOverlay,
  }

  return ocaBundle
}

const mapW3CCredToCard = (
  w3cCred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
  brandingOverlay: CredentialOverlay<BrandingOverlay>,
  brandingOverlayTypeString: string
): WalletCredentialCardData => {
  const credentialDisplay = getCredentialForDisplay(w3cCred)
  const extraAttributeValue = credentialDisplay.display.primary_overlay_attribute
    ? getAttributeField(credentialDisplay, credentialDisplay.display.primary_overlay_attribute)?.field
    : undefined

  const input = {
    vc: {
      issuer: credentialDisplay.display.description,
      type: credentialDisplay.metadata.type ? [credentialDisplay.metadata.type] : ['VerifiableCredential'],
      credentialSubject: credentialDisplay.credentialSubject,
      name: credentialDisplay.display.name,
    },
    branding: {
      type: brandingOverlayTypeString,
      primaryBg: brandingOverlay?.brandingOverlay?.primaryBackgroundColor,
      secondaryBg: brandingOverlay?.brandingOverlay?.secondaryBackgroundColor,
      logo1x1Uri: brandingOverlay?.brandingOverlay?.logo,
      backgroundSliceUri: brandingOverlay?.brandingOverlay?.backgroundImageSlice,
      backgroundFullUri: brandingOverlay?.brandingOverlay?.backgroundImage,
      preferredTextColor: undefined,
      watermark: brandingOverlay?.metaOverlay?.watermark,
    },
    labels: brandingOverlay?.bundle?.labelOverlay?.attributeLabels,
    primary_overlay_attribute: extraAttributeValue,
    helpActionUrl:
      (brandingOverlay as any)?.bundle?.bundle?.metadata?.issuerUrl?.en ??
      (brandingOverlay as any)?.bundle?.bundle?.metadata?.issuerUrl?.['en-US'] ??
      undefined,
  } as W3CInput

  return mapW3CToCard(input, credentialDisplay.id)
}

/**
 * Generic map function to convert a CredentialExchangeRecord (AnonCreds or W3C) to WalletCredentialCardData
 * Uses OCA bundle resolver to fetch overlays as needed.
 * If a brandingOverlay is provided, it will be used instead of resolving a new one.
 * If proof=true, will map in proof context (limited attributes, no PII, no primary/secondary ordering).
 */
export interface GenericCardMapInput {
  credential: GenericCredentialExchangeRecord
  bundleResolver: OCABundleResolverType
  colorPalette: IColorPalette
  unknownIssuerName: string
  brandingOverlay?: CredentialOverlay<BrandingOverlay>
  proof?: boolean
  credentialErrors?: CredentialErrors[]
  credName?: string
  credentialConnectionLabel?: string
  displayItems?: (Attribute | Predicate)[]
}

export async function mapCredentialTypeToCard({
  credential,
  bundleResolver,
  colorPalette,
  unknownIssuerName,
  brandingOverlay,
  proof = false,
  credentialErrors,
  credName,
  credentialConnectionLabel,
  displayItems,
}: GenericCardMapInput): Promise<WalletCredentialCardData | undefined> {
  const brandingTypeString = brandingOverlayTypeString(bundleResolver.getBrandingOverlayType())

  //W3C case
  if (
    credential instanceof W3cCredentialRecord ||
    credential instanceof SdJwtVcRecord ||
    credential instanceof MdocRecord
  ) {
    const bo = brandingOverlay ?? (await resolveBundleForW3CCredential(credential, bundleResolver))
    return mapW3CCredToCard(credential, bo, brandingTypeString)
  }

  //Anoncreds case
  const rec = credential as CredentialExchangeRecord
  if (!rec) return undefined

  const isRevoked = !!credentialErrors?.includes(CredentialErrors.Revoked)
  const notInWallet = !!credentialErrors?.includes(CredentialErrors.NotInWallet)

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
        colorPalette.grayscale.lightGrey,
      secondaryBg: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.secondaryBackgroundColor,
      logo1x1Uri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.logo,
      logoText:
        overlay.metaOverlay?.issuer && overlay.metaOverlay?.issuer !== 'Unknown Contact'
          ? overlay.metaOverlay?.issuer
          : unknownIssuerName,
      backgroundSliceUri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.backgroundImageSlice,
      backgroundFullUri: (overlay as CredentialOverlay<BrandingOverlay>)?.brandingOverlay?.backgroundImage,
      preferredTextColor: undefined,
    },
  } as AnonCredsBundleLite

  return mapAnonCredsToCard(rec, bundleLite as any, {
    proofContext: !!proof,
    revoked: isRevoked,
    notInWallet,
    connectionLabel: credentialConnectionLabel,
    displayItems: proof ? displayItems : undefined,
  })
}
