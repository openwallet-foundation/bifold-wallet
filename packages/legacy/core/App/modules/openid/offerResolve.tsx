import {
  OpenId4VcCredentialHolderBinding,
  OpenId4VciCredentialBindingOptions,
  OpenId4VciCredentialFormatProfile,
  OpenId4VciCredentialSupportedWithId,
  OpenId4VciRequestTokenResponse,
  OpenId4VciResolvedCredentialOffer,
} from '@credo-ts/openid4vc'
import {
  Agent,
  DidJwk,
  DidKey,
  getJwkFromKey,
  JwaSignatureAlgorithm,
  JwkDidCreateOptions,
  KeyBackend,
  KeyDidCreateOptions,
  Mdoc,
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  W3cJsonLdVerifiableCredential,
  W3cJwtVerifiableCredential,
} from '@credo-ts/core'
import { extractOpenId4VcCredentialMetadata, setOpenId4VcCredentialMetadata } from './metadata'

export const resolveOpenId4VciOffer = async ({
  agent,
  data,
  uri,
  authorization,
}: {
  agent: Agent
  // Either data itself (the offer) or uri can be passed
  data?: string
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

  const resolvedCredentialOffer = await agent.modules.openId4VcHolder.resolveCredentialOffer(offerUri)

  if (authorization) {
    throw new Error('Authorization flow is not supported yet as of Credo 0.5.13')
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
}) {
  return await agent.modules.openId4VcHolder.requestToken({
    resolvedCredentialOffer,
    txCode,
  })
}

export const customCredentialBindingResolver = async ({
  agent,
  supportedDidMethods,
  keyType,
  supportsAllDidMethods,
  supportsJwk,
  credentialFormat,
  supportedCredentialId,
  resolvedCredentialOffer,
  pidSchemes,
}: Partial<OpenId4VciCredentialBindingOptions> & {
  agent: Agent
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer
  pidSchemes?: { sdJwtVcVcts: Array<string>; msoMdocDoctypes: Array<string> }
}): Promise<OpenId4VcCredentialHolderBinding> => {
  // First, we try to pick a did method
  // Prefer did:jwk, otherwise use did:key, otherwise use undefined
  let didMethod: 'key' | 'jwk' | undefined =
    supportsAllDidMethods || supportedDidMethods?.includes('did:jwk')
      ? 'jwk'
      : supportedDidMethods?.includes('did:key')
      ? 'key'
      : undefined

  // If supportedDidMethods is undefined, and supportsJwk is false, we will default to did:key
  // this is important as part of MATTR launchpad support which MUST use did:key but doesn't
  // define which did methods they support
  if (!supportedDidMethods && !supportsJwk) {
    didMethod = 'key'
  }

  const offeredCredentialConfiguration = supportedCredentialId
    ? resolvedCredentialOffer.offeredCredentialConfigurations[supportedCredentialId]
    : undefined

  const shouldKeyBeHardwareBackedForMsoMdoc =
    offeredCredentialConfiguration?.format === OpenId4VciCredentialFormatProfile.MsoMdoc &&
    pidSchemes?.msoMdocDoctypes.includes(offeredCredentialConfiguration.doctype)

  const shouldKeyBeHardwareBackedForSdJwtVc =
    offeredCredentialConfiguration?.format === 'vc+sd-jwt' &&
    pidSchemes?.sdJwtVcVcts.includes(offeredCredentialConfiguration.vct)

  const shouldKeyBeHardwareBacked = shouldKeyBeHardwareBackedForSdJwtVc || shouldKeyBeHardwareBackedForMsoMdoc

  if (!keyType) {
    throw new Error('keyType is required!')
  }

  const key = await agent.wallet.createKey({
    keyType,
    keyBackend: shouldKeyBeHardwareBacked ? KeyBackend.SecureElement : KeyBackend.Software,
  })

  if (didMethod) {
    const didResult = await agent.dids.create<JwkDidCreateOptions | KeyDidCreateOptions>({
      method: didMethod,
      options: {
        key,
      },
    })

    if (didResult.didState.state !== 'finished') {
      throw new Error('DID creation failed.')
    }

    let verificationMethodId: string
    if (didMethod === 'jwk') {
      const didJwk = DidJwk.fromDid(didResult.didState.did)
      verificationMethodId = didJwk.verificationMethodId
    } else {
      const didKey = DidKey.fromDid(didResult.didState.did)
      verificationMethodId = `${didKey.did}#${didKey.key.fingerprint}`
    }

    return {
      didUrl: verificationMethodId,
      method: 'did',
    }
  }

  // Otherwise we also support plain jwk for sd-jwt only
  if (
    supportsJwk &&
    (credentialFormat === OpenId4VciCredentialFormatProfile.SdJwtVc ||
      credentialFormat === OpenId4VciCredentialFormatProfile.MsoMdoc)
  ) {
    return {
      method: 'jwk',
      jwk: getJwkFromKey(key),
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
  accessToken,
  credentialConfigurationIdsToRequest,
  clientId,
  pidSchemes,
}: {
  agent: Agent
  resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer
  accessToken: OpenId4VciRequestTokenResponse
  credentialConfigurationIdsToRequest?: string[]
  clientId?: string
  pidSchemes?: { sdJwtVcVcts: Array<string>; msoMdocDoctypes: Array<string> }
}) => {
  const offeredCredentialsToRequest = credentialConfigurationIdsToRequest
    ? resolvedCredentialOffer.offeredCredentials.filter((offered) =>
        credentialConfigurationIdsToRequest.includes(offered.id)
      )
    : [resolvedCredentialOffer.offeredCredentials[0]]

  if (offeredCredentialsToRequest.length === 0) {
    throw new Error(
      `Parameter 'credentialConfigurationIdsToRequest' with values ${credentialConfigurationIdsToRequest} is not a credential_configuration_id in the credential offer.`
    )
  }

  const credentials = await agent.modules.openId4VcHolder.requestCredentials({
    resolvedCredentialOffer,
    ...accessToken,
    clientId,
    credentialsToRequest: credentialConfigurationIdsToRequest,
    verifyCredentialStatus: false,
    allowedProofOfPossessionSignatureAlgorithms: [
      // NOTE: MATTR launchpad for JFF MUST use EdDSA. So it is important that the default (first allowed one)
      // is EdDSA. The list is ordered by preference, so if no suites are defined by the issuer, the first one
      // will be used
      JwaSignatureAlgorithm.EdDSA,
      JwaSignatureAlgorithm.ES256,
    ],
    credentialBindingResolver: async ({
      supportedDidMethods,
      keyType,
      supportsAllDidMethods,
      supportsJwk,
      credentialFormat,
      supportedCredentialId,
    }: OpenId4VciCredentialBindingOptions) => {
      return customCredentialBindingResolver({
        agent,
        supportedDidMethods,
        keyType,
        supportsAllDidMethods,
        supportsJwk,
        credentialFormat,
        supportedCredentialId,
        resolvedCredentialOffer,
        pidSchemes,
      })
    },
  })

  // We only support one credential for now
  const [firstCredential] = credentials
  if (!firstCredential)
    throw new Error('Error retrieving credential using pre authorized flow: firstCredential undefined!.')

  let record: SdJwtVcRecord | W3cCredentialRecord | MdocRecord

  if (typeof firstCredential === 'string') {
    throw new Error('Error retrieving credential using pre authorized flow: firstCredential is string.')
  }

  if ('compact' in firstCredential.credential) {
    // TODO: add claimFormat to SdJwtVc
    record = new SdJwtVcRecord({
      compactSdJwtVc: firstCredential.credential.compact,
    })
  } else if (firstCredential.credential instanceof Mdoc) {
    record = new MdocRecord({
      mdoc: firstCredential.credential,
    })
  } else {
    record = new W3cCredentialRecord({
      credential: firstCredential.credential as W3cJwtVerifiableCredential | W3cJsonLdVerifiableCredential,
      // We don't support expanded types right now, but would become problem when we support JSON-LD
      tags: {},
    })
  }

  const openId4VcMetadata = extractOpenId4VcCredentialMetadata(
    resolvedCredentialOffer.offeredCredentials[0] as OpenId4VciCredentialSupportedWithId,
    {
      id: resolvedCredentialOffer.metadata.issuer,
      display: resolvedCredentialOffer.metadata.credentialIssuerMetadata.display,
    }
  )

  setOpenId4VcCredentialMetadata(record, openId4VcMetadata)

  return record
}
