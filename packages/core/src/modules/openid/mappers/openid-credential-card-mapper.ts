import startCase from 'lodash.startcase'
import type { WalletCredentialCardAttribute, WalletCredentialCardViewModel } from '../../../wallet/card-view-model'
import type { W3cCredentialDisplay } from '../types'

type MapOpenIdCredentialToCardViewModelOptions = {
  revoked?: boolean
}

const toCardAttribute = (key: string, value: unknown, label: string): WalletCredentialCardAttribute => {
  const isImage = typeof value === 'string' && /^data:image\//.test(value)

  return {
    key,
    label,
    value:
      value === null || value === undefined || typeof value === 'string' || typeof value === 'number'
        ? (value ?? null)
        : JSON.stringify(value),
    format: isImage ? 'image' : 'text',
  }
}

/**
 * Maps OpenID display metadata into the local card view contract. This mapper
 * intentionally has no OCA dependency: OpenID display metadata is its source
 * of branding, labels, and attribute order.
 */
export const mapOpenIdCredentialToCardViewModel = (
  credential: W3cCredentialDisplay,
  options: MapOpenIdCredentialToCardViewModelOptions = {}
): WalletCredentialCardViewModel => {
  const labels = credential.credentialSubject ?? {}
  const attributesByKey = Object.entries(credential.attributes)
  const order = credential.attributeOrder ?? []
  const orderedAttributes = [
    ...order.flatMap((key) => attributesByKey.filter(([attributeKey]) => attributeKey === key)),
    ...attributesByKey.filter(([key]) => !order.includes(key)),
  ]

  const attributes = orderedAttributes.map(([key, value]) => {
    const localizedLabel = labels[key]?.display[0]?.name
    return toCardAttribute(key, value, localizedLabel ?? startCase(key))
  })
  const primaryAttributeKey = credential.display.primary_overlay_attribute
  const extraAttribute = primaryAttributeKey
    ? attributes.find((attribute) => attribute.key === primaryAttributeKey)
    : undefined

  return {
    id: credential.id,
    layout: 'card11',
    issuerName: credential.display.issuer.name,
    credentialName: credential.display.name,
    branding: {
      primaryBackgroundColor: credential.display.backgroundColor,
      secondaryBackgroundColor: credential.display.backgroundColor,
      logoUri: credential.display.issuer.logo?.uri ?? credential.display.logo?.uri,
      logoText: credential.display.issuer.name.slice(0, 1).toUpperCase(),
      backgroundImageUri: credential.display.backgroundImage?.uri,
      preferredTextColor: credential.display.textColor,
    },
    attributes,
    primaryAttributeKey,
    extraAttribute,
    revoked: options.revoked,
    status: options.revoked ? 'error' : undefined,
    hideBrandingSlice: true,
  }
}
