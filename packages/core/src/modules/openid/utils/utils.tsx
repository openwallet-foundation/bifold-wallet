import { getDomainFromUrl } from '@credo-ts/core'
import { Attribute, Field } from '@bifold/oca/build/legacy'
import { OpenId4VciCredentialConfigurationsSupportedWithFormats, OpenId4VciResolvedCredentialOffer } from '@credo-ts/openid4vc'
import { RefreshCredentialMetadata } from '../refresh/types'

/**
 * Converts a camelCase string to a sentence format (first letter capitalized, rest in lower case).
 * i.e. sanitizeString("helloWorld")  // returns: 'Hello world'
 */
export function sanitizeString(str: string) {
  const result = str.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replaceAll('_', ' ')
  let words = result.split(' ')
  words = words.map((word, index) => {
    if (index === 0 || word.toUpperCase() === word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    }
    return word.charAt(0).toLowerCase() + word.slice(1)
  })
  return words.join(' ')
}

export function getHostNameFromUrl(url: string) {
  try {
    return getDomainFromUrl(url)
  } catch (error) {
    throw new Error(`Error getting hostname from url: ${error}`)
  }
}

export const buildFieldsFromOpenIDTemplate = (data: { [key: string]: unknown }): Array<Field> => {
  const fields = []
  for (const key of Object.keys(data)) {
    // omit id and type
    if (key === 'id' || key === 'type') continue

    let pushedVal: string | number | null = null
    if (typeof data[key] === 'string' || typeof data[key] === 'number') {
      pushedVal = data[key] as string | number | null
    }
    fields.push(new Attribute({ name: key, value: pushedVal }))
  }
  return fields
}

export function formatDate(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Mostly used for mdoc crednetials
 */
export function detectImageMimeType(data: Uint8Array): 'image/jpeg' | 'image/jp2' | null {
  // Check if array is too short to contain magic numbers
  if (data.length < 12) {
    return null
  }

  // JPEG starts with FF D8 FF
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg'
  }

  // JPEG2000 has two possible signatures:
  // 1) 00 00 00 0C 6A 50 20 20 0D 0A 87 0A
  // 2) FF 4F FF 51

  // Check first signature
  if (
    data[0] === 0x00 &&
    data[1] === 0x00 &&
    data[2] === 0x00 &&
    data[3] === 0x0c &&
    data[4] === 0x6a && // 'j'
    data[5] === 0x50 && // 'P'
    data[6] === 0x20 &&
    data[7] === 0x20 &&
    data[8] === 0x0d &&
    data[9] === 0x0a &&
    data[10] === 0x87 &&
    data[11] === 0x0a
  ) {
    return 'image/jp2'
  }

  // Check second signature
  if (data[0] === 0xff && data[1] === 0x4f && data[2] === 0xff && data[3] === 0x51) {
    return 'image/jp2'
  }

  return null
}

/**
 * very simple matcher for `yyyy-mm-dd`
 */
export function isDateString(value: string) {
  // We do the length check first to avoid unnecesary regex
  return value.length === 'yyyy-mm-dd'.length && value.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
}

export function isW3CProofRequest(type: string): boolean {
  if (type === 'jwt_vc') {
    return true
  }
  return false
}

export function isSdJwtProofRequest(type: string): boolean {
  if (type === 'vc+sd-jwt') {
    return true
  }
  return false
}

export function isMdocProofRequest(type: string): boolean {
  if (type === 'mso_mdoc') {
    return true
  }
  return false
}

export function getCredentialConfigurationIds(resolved: OpenId4VciResolvedCredentialOffer): string[] {
  const fromOffered = (resolved.credentialOfferPayload.credential_configuration_ids ?? []).filter((x): x is string => !!x)

  if (fromOffered.length > 0) return fromOffered

  const cfg = resolved.offeredCredentialConfigurations
  if (cfg && typeof cfg === 'object') {
    return Object.keys(cfg) // keys are the credential_configuration_id values
  }

  return []
}

export function buildResolvedOfferFromMeta(meta: RefreshCredentialMetadata): OpenId4VciResolvedCredentialOffer {
  const { credentialIssuer, credentialConfigurationId, tokenEndpoint, authServer, issuerMetadataCache } = meta

  const supported = issuerMetadataCache.credential_configurations_supported?.[credentialConfigurationId]
  if (!supported) {
    throw new Error(`No cached supported config for "${credentialConfigurationId}"`)
  }

  // Derive an "offeredCredential" object from the supported config.
  // (Keys differ slightly between the two sections, so we map minimally.)
  const offered: OpenId4VciCredentialConfigurationsSupportedWithFormats = {
    // id: credentialConfigurationId,
    format: supported.format,
    cryptographic_binding_methods_supported: supported.cryptographic_binding_methods_supported,
    // These two are optional; include them if present in your issuer’s metadata
    credentialSubject: supported.credential_definition?.credentialSubject,
    types: supported.credential_definition?.type,
    // If you want, you can also map signing algs:
    cryptographic_suites_supported: supported.credential_signing_alg_values_supported,
    // display omitted per your preference
  }

  return {
    metadata: {
      originalDraftVersion: 'V1' as any,
      credentialIssuer: { 
        credential_issuer: issuerMetadataCache.credential_issuer,
        credential_endpoint: issuerMetadataCache.credential_endpoint ?? '',
        credential_configurations_supported: issuerMetadataCache.credential_configurations_supported ?? {}
      },
      authorizationServers: [{
        issuer: credentialIssuer,
        token_endpoint: tokenEndpoint
      }],
      knownCredentialConfigurations: {}
    },
    credentialOfferPayload: {
      credential_issuer: issuerMetadataCache.credential_issuer,
      credential_configuration_ids: Object.keys(issuerMetadataCache.credential_configurations_supported ?? {})
    },
    offeredCredentialConfigurations: offered
  }
  // TODO: Validate that the updated return signature is actually valid compared to this.
  // return {
  //   metadata: {
  //     issuer: credentialIssuer,
  //     token_endpoint: tokenEndpoint ?? issuerMetadataCache.token_endpoint, // top-level field
  //     credential_endpoint: issuerMetadataCache.credential_endpoint, // top-level field
  //     authorization_server: authServer, // singular string
  //     // keep full issuer metadata (with its own authorization_servers array)
  //     credentialIssuerMetadata: {
  //       ...issuerMetadataCache,
  //       // make sure credential_configurations_supported at least contains our chosen one
  //       credential_configurations_supported: {
  //         [credentialConfigurationId]: supported,
  //       },
  //     },
  //   },
  //   // Offered credential “instances”
  //   offeredCredentials: [offered],
  //   // Optional but nice to include to mirror your resolver’s output
  //   offeredCredentialConfigurations: {
  //     [credentialConfigurationId]: supported,
  //   },
  //   version: 1011, // optional; include if your types expect it
  // } as OpenId4VciResolvedCredentialOffer
}
