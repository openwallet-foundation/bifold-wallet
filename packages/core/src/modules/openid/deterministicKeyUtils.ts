import { Agent, Key, KeyType } from '@credo-ts/core'
import { OpenId4VciResolvedCredentialOffer } from '@credo-ts/openid4vc'
import { DeterministicP256 } from '@algorandfoundation/dp256'
import { loadMnemonic } from '../../services/keychain'

/**
 * Utilities for deterministic key generation using dp256 in OpenID4VC contexts
 */

/**
 * Extracts BIP39 phrase from various agent storage locations
 */
export const getBip39PhraseFromSecureStorage = async (agent: Agent): Promise<string> => {
  // First try to get from wallet config seed (used during wallet initialization)
  const walletConfig = agent.config.walletConfig
  if (walletConfig && 'seed' in walletConfig) {
    const seed = (walletConfig as any).seed
    return seed
  }

  // Try to load from secure keychain storage (where the app actually stores it)
  try {
    const mnemonic = await loadMnemonic()
    if (mnemonic) {
      return mnemonic
    }
  } catch (error) {
    // Continue to other methods if keychain access fails
  }

  // Fallback: check secure storage (alternative storage method)
  const secureStorage = (agent.config as any).secureStorage
  if (secureStorage) {
    const phrase = await secureStorage.getItem('bip39_mnemonic')
    if (phrase) {
      return phrase
    }
  }

  // Fallback: check agent context
  const agentContext = (agent as any).context
  if (agentContext?.bip39Phrase) {
    const phrase = agentContext.bip39Phrase
    return phrase
  }

  throw new Error('BIP39 phrase not found in secure storage, wallet config, or agent context')
}

/**
 * Extracts origin domain from credential offer for deterministic key generation
 */
export const extractOriginFromCredentialOffer = (
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer,
  logger?: { info: (msg: string) => void; warn: (msg: string) => void; debug: (msg: string) => void }
): string => {
  logger?.debug('[DP256] Extracting origin from credential offer')

  let issuerUrl: string | undefined

  if (resolvedCredentialOffer.metadata?.issuer) {
    issuerUrl = resolvedCredentialOffer.metadata.issuer
    logger?.debug(`[DP256] Found issuer URL in metadata.issuer: ${issuerUrl}`)
  } else if (resolvedCredentialOffer.metadata?.credentialIssuerMetadata) {
    const issuerMetadata = resolvedCredentialOffer.metadata.credentialIssuerMetadata
    issuerUrl = (issuerMetadata as any).credential_issuer || (issuerMetadata as any).issuer
    logger?.debug(`[DP256] Found issuer URL in credentialIssuerMetadata: ${issuerUrl}`)
  } else if ((resolvedCredentialOffer as any).originalOfferUri) {
    const offerUri = (resolvedCredentialOffer as any).originalOfferUri
    const urlMatch = offerUri.match(/https?:\/\/[^/]+/)
    if (urlMatch) {
      issuerUrl = urlMatch[0]
      logger?.debug(`[DP256] Found issuer URL in originalOfferUri: ${issuerUrl}`)
    }
  }

  if (!issuerUrl) {
    const offerString = JSON.stringify(resolvedCredentialOffer)
    const urlMatches = offerString.match(/https?:\/\/[^\s"]+/g)
    if (urlMatches?.length) {
      issuerUrl = urlMatches[0]
      logger?.debug(`[DP256] Found issuer URL via regex search: ${issuerUrl}`)
    }
  }

  if (issuerUrl) {
    try {
      const url = new URL(issuerUrl)
      const origin = `${url.protocol}//${url.host}`
      logger?.debug(`[DP256] Extracted origin: ${origin}`)
      return origin
    } catch {
      logger?.warn(`[DP256] Invalid URL format: ${issuerUrl}, falling back to generated domain`)
      // Invalid URL, continue to fallback
    }
  }

  const offerHash = JSON.stringify(resolvedCredentialOffer).slice(0, 100)
  const hashCode = offerHash.split('').reduce((hash, char) => {
    return (hash << 5) - hash + char.charCodeAt(0)
  }, 0)
  const domainSuffix = Math.abs(hashCode).toString(36).slice(0, 8)
  const fallbackOrigin = `https://issuer-${domainSuffix}.credential-provider.com`

  logger?.info(`[DP256] No issuer URL found, using fallback origin: ${fallbackOrigin}`)
  return fallbackOrigin
}

/**
 * Derives user handle from agent configuration for deterministic key generation
 */
export const getUserHandleFromAgent = async (agent: Agent): Promise<string> => {
  const agentContext = (agent as any).context
  if (agentContext?.userId) {
    const userHandle = agentContext.userId
    return userHandle
  }

  try {
    const dids = await agent.dids.getCreatedDids()
    if (dids.length > 0) {
      const didHash = dids[0].did.split(':').pop()?.slice(0, 16) || 'unknown'
      const userHandle = `did-${didHash}`
      return userHandle
    }
  } catch (error) {
    // Continue to next option
  }

  const walletId = agent.config.walletConfig?.id
  if (walletId) {
    const userHandle = `wallet-${walletId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`
    return userHandle
  }

  const walletLabel = (agent.config.walletConfig as any)?.label
  if (walletLabel) {
    const userHandle = `user-${walletLabel.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`
    return userHandle
  }

  const agentConfigHash = JSON.stringify({
    walletConfig: agent.config.walletConfig,
    logger: agent.config.logger.constructor.name,
  })

  let hash = 0
  for (let i = 0; i < agentConfigHash.length; i++) {
    const char = agentConfigHash.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const userHandle = `agent-${Math.abs(hash).toString(36).slice(0, 12)}`
  return userHandle
}

/**
 * Creates a deterministic software key using dp256 for reproducible key generation
 */
export const createDeterministicSoftwareKey = async ({
  keyType,
  bip39Phrase,
  origin,
  userHandle,
  counter = 0,
  logger,
}: {
  keyType: KeyType
  bip39Phrase: string
  origin: string
  userHandle: string
  counter?: number
  logger?: { info: (msg: string) => void; error: (msg: string) => void; debug: (msg: string) => void }
}): Promise<Key> => {
  logger?.debug(
    `[DP256] Creating deterministic ${keyType} key with origin: ${origin}, userHandle: ${userHandle}, counter: ${counter}`
  )

  if (keyType !== KeyType.P256) {
    logger?.error(`[DP256] Unsupported key type: ${keyType}`)
    throw new Error('Deterministic keys currently only support P256 curve')
  }

  const dp256 = new DeterministicP256()
  const derivedMainKey = await dp256.genDerivedMainKeyWithBIP39(bip39Phrase)
  logger?.debug('[DP256] Derived main key from BIP39 phrase')

  const dp256PrivateKey = await dp256.genDomainSpecificKeyPair(derivedMainKey, origin, userHandle, counter)
  logger?.debug('[DP256] Generated domain-specific key pair')

  const dp256PublicKey = dp256.getPurePKBytes(dp256PrivateKey)
  logger?.debug(`[DP256] Extracted public key bytes (${dp256PublicKey.length} bytes)`)

  // Create Credo Key from dp256 public key
  const credoKey = Key.fromPublicKey(dp256PublicKey, keyType)
  logger?.info('[DP256] Created deterministic software key successfully')

  return credoKey
}

/**
 * Convenience function to create deterministic key with all inputs extracted from agent and offer
 */
export const createDeterministicKeyFromContext = async (
  agent: Agent,
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer,
  keyType: KeyType,
  counter = 0
): Promise<Key> => {
  agent.config.logger.info('[DP256] Starting deterministic software key generation from context')

  const bip39Phrase = await getBip39PhraseFromSecureStorage(agent)
  const origin = extractOriginFromCredentialOffer(resolvedCredentialOffer, agent.config.logger)
  const userHandle = await getUserHandleFromAgent(agent)

  agent.config.logger.debug(
    `[DP256] Key generation inputs - Type: ${keyType}, Origin: ${origin}, UserHandle: ${userHandle}, Counter: ${counter}`
  )

  const key = await createDeterministicSoftwareKey({
    keyType,
    bip39Phrase,
    origin,
    userHandle,
    counter,
    logger: agent.config.logger,
  })

  agent.config.logger.info('[DP256] Deterministic software key generation completed successfully')
  return key
}
