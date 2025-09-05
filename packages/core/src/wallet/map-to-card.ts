import type { CredentialExchangeRecord } from '@credo-ts/core'
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
import { Attribute, Predicate } from '@bifold/oca/build/legacy'

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
    helpActionUrl: input.helpActionUrl,
    status: undefined,
  }
}
