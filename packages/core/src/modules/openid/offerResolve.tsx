import {
  OpenId4VcCredentialHolderBinding,
  OpenId4VciCredentialBindingOptions,
  OpenId4VciCredentialFormatProfile,
  OpenId4VciRequestTokenResponse,
  OpenId4VciResolvedCredentialOffer,
} from '@credo-ts/openid4vc'
import { Agent, DidJwk, DidKey, JwkDidCreateOptions, KeyDidCreateOptions, Kms } from '@credo-ts/core'
import { extractOpenId4VcCredentialMetadata, setOpenId4VcCredentialMetadata } from './metadata'
import { OpenIDCredentialRecord } from './credentialRecord'

type CredentialBindingResolverOptions = Pick<
  OpenId4VciCredentialBindingOptions,
  'credentialFormat' | 'proofTypes' | 'supportedDidMethods' | 'supportsAllDidMethods' | 'supportsJwk'
> & {
  agent: Agent
}

const getCredentialConfigurationIdsToRequest = ({
  resolvedCredentialOffer,
  credentialConfigurationIdsToRequest,
}: {
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer
  credentialConfigurationIdsToRequest?: string[]
}) => {
  const credentialConfigurationIds = credentialConfigurationIdsToRequest ?? [
    Object.keys(resolvedCredentialOffer.offeredCredentialConfigurations)[0],
  ]

  if (credentialConfigurationIds.length === 0 || !credentialConfigurationIds[0]) {
    throw new Error('No credential configuration ID found in the credential offer.')
  }

  for (const credentialConfigurationId of credentialConfigurationIds) {
    if (!resolvedCredentialOffer.offeredCredentialConfigurations[credentialConfigurationId]) {
      throw new Error(
        `Parameter 'credentialConfigurationIdsToRequest' with values ${credentialConfigurationIdsToRequest} is not a credential_configuration_id in the credential offer.`
      )
    }
  }

  return credentialConfigurationIds
}

export const resolveOpenId4VciOffer = async ({
  agent,
  data,
  uri,
  authorization,
}: {
  agent: Agent
  // Either data itself (the offer) or uri can be passed
  data?: unknown
  uri?: string
  fetchAuthorization?: boolean
  authorization?: { clientId: string; redirectUri: string }
}): Promise<OpenId4VciResolvedCredentialOffer> => {
  let offerUri = uri

  if (!offerUri && data) {
    // FIXME: Credo only support credential offer string, but we already parsed it before. So we construct an offer here
    // but in the future we need to support the parsed offer in Credo directly
    offerUri = `openid-credential-offer://credential_offer=${encodeURIComponent(JSON.stringify(data))}`
  } else if (!offerUri) {
    throw new Error('either data or uri must be provided')
  }

  agent.config.logger.info(`Receiving openid uri ${offerUri}`, {
    offerUri,
    data: data,
    uri: offerUri,
  })

  const resolvedCredentialOffer = await agent.openid4vc.holder.resolveCredentialOffer(offerUri)

  if (authorization) {
    throw new Error('Authorization code flow is not implemented in this OpenID credential offer flow.')
  }

  return resolvedCredentialOffer
}

export async function acquirePreAuthorizedAccessToken({
  agent,
  resolvedCredentialOffer,
  txCode,
}: {
  agent: Agent
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer
  txCode?: string
}): Promise<OpenId4VciRequestTokenResponse> {
  return await agent.openid4vc.holder.requestToken({
    resolvedCredentialOffer,
    txCode,
  })
}

export const customCredentialBindingResolver = async ({
  agent,
  supportedDidMethods,
  supportsAllDidMethods,
  supportsJwk,
  credentialFormat,
  proofTypes,
}: CredentialBindingResolverOptions): Promise<OpenId4VcCredentialHolderBinding> => {
  let didMethod: 'key' | 'jwk' | undefined =
    supportsAllDidMethods || supportedDidMethods?.includes('did:jwk')
      ? 'jwk'
      : supportedDidMethods?.includes('did:key')
        ? 'key'
        : undefined

  if (!supportedDidMethods && !supportsJwk) {
    didMethod = 'key'
  }

  const key = await agent.kms.createKeyForSignatureAlgorithm({
    algorithm: proofTypes?.jwt?.supportedSignatureAlgorithms[0] ?? 'EdDSA',
  })
  const publicJwk = Kms.PublicJwk.fromPublicJwk(key.publicJwk)

  if (didMethod) {
    const didResult = await agent.dids.create<JwkDidCreateOptions | KeyDidCreateOptions>({
      method: didMethod,
      options: {
        keyId: key.keyId,
      },
    })

    if (didResult.didState.state !== 'finished') {
      throw new Error('DID creation failed.')
    }

    let didUrl: string
    if (didMethod === 'jwk') {
      didUrl = DidJwk.fromDid(didResult.didState.did).verificationMethodId
    } else {
      const didKey = DidKey.fromDid(didResult.didState.did)
      didUrl = `${didKey.did}#${didKey.publicJwk.fingerprint}`
    }

    return {
      method: 'did',
      didUrls: [didUrl],
    }
  }

  // Fallback: plain jwk for sd-jwt/mdoc only
  if (
    supportsJwk &&
    (credentialFormat === OpenId4VciCredentialFormatProfile.SdJwtVc ||
      credentialFormat === OpenId4VciCredentialFormatProfile.MsoMdoc)
  ) {
    return {
      method: 'jwk',
      keys: [publicJwk], // Need to replace getJwkFromKey here
    }
  }

  throw new Error(
    `No supported binding method could be found. Supported methods are did:key and did:jwk, or plain jwk for sd-jwt/mdoc. Issuer supports ${
      supportsJwk ? 'jwk, ' : ''
    }${supportedDidMethods?.join(', ') ?? 'Unknown'}`
  )
}

export const receiveCredentialFromOpenId4VciOffer = async ({
  agent,
  resolvedCredentialOffer,
  tokenResponse,
  credentialConfigurationIdsToRequest,
  clientId,
}: {
  agent: Agent
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer
  tokenResponse: OpenId4VciRequestTokenResponse
  credentialConfigurationIdsToRequest?: string[]
  clientId?: string
}): Promise<OpenIDCredentialRecord> => {
  const credentialConfigurationIds = getCredentialConfigurationIdsToRequest({
    resolvedCredentialOffer,
    credentialConfigurationIdsToRequest,
  })

  const credentials = await agent.openid4vc.holder.requestCredentials({
    resolvedCredentialOffer,
    ...tokenResponse,
    clientId,
    credentialConfigurationIds,
    verifyCredentialStatus: false,
    allowedProofOfPossessionSignatureAlgorithms: [
      // NOTE: MATTR launchpad for JFF MUST use EdDSA. So it is important that the default (first allowed one)
      // is EdDSA. The list is ordered by preference, so if no suites are defined by the issuer, the first one
      // will be used
      'EdDSA',
      'ES256',
    ],
    credentialBindingResolver: async ({
      supportedDidMethods,
      proofTypes,
      supportsAllDidMethods,
      supportsJwk,
      credentialFormat,
    }: OpenId4VciCredentialBindingOptions) => {
      return customCredentialBindingResolver({
        agent,
        supportedDidMethods,
        proofTypes,
        supportsAllDidMethods,
        supportsJwk,
        credentialFormat,
      })
    },
  })

  // We only support one credential for now
  const [firstCredential] = credentials.credentials
  if (!firstCredential)
    throw new Error('Error retrieving credential using pre authorized flow: firstCredential undefined!.')

  if (typeof firstCredential === 'string') {
    throw new Error('Error retrieving credential using pre authorized flow: firstCredential is string.')
  }

  const record = firstCredential.record
  const requestedCredentialConfiguration =
    resolvedCredentialOffer.offeredCredentialConfigurations[credentialConfigurationIds[0]]

  const openId4VcMetadata = extractOpenId4VcCredentialMetadata(requestedCredentialConfiguration as any, {
    id: resolvedCredentialOffer.metadata.credentialIssuer.credential_issuer,
    display: resolvedCredentialOffer.metadata.credentialIssuer.display,
  })

  setOpenId4VcCredentialMetadata(record, openId4VcMetadata)

  return record
}
