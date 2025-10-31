import {
  Agent,
  JwaSignatureAlgorithm,
  Mdoc,
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  W3cJsonLdVerifiableCredential,
  W3cJwtVerifiableCredential,
} from '@credo-ts/core'
import { RefreshResponse } from '../types'
import {
  OpenId4VciCredentialBindingOptions,
  OpenId4VciCredentialSupportedWithId,
  OpenId4VciResolvedCredentialOffer,
} from '@credo-ts/openid4vc'
import { customCredentialBindingResolver } from '../offerResolve'
import { BifoldLogger } from '../../../services/logger'
import {
  extractOpenId4VcCredentialMetadata,
  getRefreshCredentialMetadata,
  setOpenId4VcCredentialMetadata,
  setRefreshCredentialMetadata,
} from '../metadata'
import { RefreshStatus } from './types'

type ReissueWithAccessTokenInput = {
  agent: Agent
  logger: BifoldLogger
  record?: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  tokenResponse: RefreshResponse
  resolvedOffer?: OpenId4VciResolvedCredentialOffer
  clientId?: string
  // optional: pass to your resolver if you need PID schemes again
  pidSchemes?: { sdJwtVcVcts: string[]; msoMdocDoctypes: string[] }
}

export async function reissueCredentialWithAccessToken({
  agent,
  logger,
  record,
  tokenResponse,
  clientId,
  pidSchemes,
}: ReissueWithAccessTokenInput): Promise<W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined> {
  // 1) From your saved metadata on the original record

  //Leave for testing
  //   const rr = new SdJwtVcRecord({ compactSdJwtVc: mockCompactSdjwt })
  //   return rr

  if (!record) {
    throw new Error('No credential record provided for re-issuance.')
  }

  const refreshMetaData = getRefreshCredentialMetadata(record)
  if (!refreshMetaData) {
    throw new Error('No refresh metadata found on the record for re-issuance.')
  }
  const { credentialConfigurationId, resolvedCredentialOffer } = refreshMetaData

  if (!resolvedCredentialOffer) {
    throw new Error('No resolved credential offer found in the refresh metadata for re-issuance.')
  }

  //Keep for later optimization of the resolvedOffer object
  //const resolvedOffer: OpenId4VciResolvedCredentialOffer = buildResolvedOfferFromMeta(refreshMetaData)

  if (!tokenResponse.access_token) {
    throw new Error('No access token found in the token response for re-issuance.')
  }

  logger.info('*** Starting to get new credential via re-issuance flow ***')
  // 4) Request a **new** credential using the *existing* configuration id
  const creds = await agent.modules.openId4VcHolder.requestCredentials({
    resolvedCredentialOffer,
    accessToken: tokenResponse.access_token,
    tokenType: tokenResponse.token_type || 'Bearer',
    cNonce: tokenResponse.c_nonce,
    clientId,
    credentialsToRequest: [credentialConfigurationId],
    verifyCredentialStatus: false, // you’ll check after storing
    allowedProofOfPossessionSignatureAlgorithms: [JwaSignatureAlgorithm.EdDSA, JwaSignatureAlgorithm.ES256],
    credentialBindingResolver: async (opts: OpenId4VciCredentialBindingOptions) =>
      customCredentialBindingResolver({
        agent,
        supportedDidMethods: opts.supportedDidMethods,
        keyType: opts.keyType,
        supportsAllDidMethods: opts.supportsAllDidMethods,
        supportsJwk: opts.supportsJwk,
        credentialFormat: opts.credentialFormat,
        supportedCredentialId: opts.supportedCredentialId,
        resolvedCredentialOffer: resolvedCredentialOffer,
        pidSchemes,
      }),
  })

  logger.info('*** New credential received via re-issuance flow ***.')

  // 5) Normalize to your local record types
  const [firstCredential] = creds
  if (!firstCredential || typeof firstCredential === 'string') {
    throw new Error('Issuer returned empty or malformed credential on re-issuance.')
  }

  let newRecord: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  if ('compact' in firstCredential.credential) {
    newRecord = new SdJwtVcRecord({ compactSdJwtVc: firstCredential.credential.compact })
  } else if ((firstCredential as any)?.credential instanceof Mdoc) {
    newRecord = new MdocRecord({ mdoc: firstCredential.credential })
  } else {
    newRecord = new W3cCredentialRecord({
      credential: firstCredential.credential as W3cJwtVerifiableCredential | W3cJsonLdVerifiableCredential,
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

  setOpenId4VcCredentialMetadata(newRecord, openId4VcMetadata)

  setRefreshCredentialMetadata(newRecord, {
    ...refreshMetaData,
    refreshToken: tokenResponse.refresh_token || refreshMetaData.refreshToken,
    lastCheckedAt: Date.now(),
    lastCheckResult: RefreshStatus.Valid,
  })

  return newRecord
}

/**
 * Get OpenID credential using access token.
 * @param param0 - The parameters for getting the OpenID credential.
 * @returns The OpenID credential.
 */
/* Will unify the flow later using the following function 
export async function getOpenIDCredentialUsingAccessToken({
  agent,
  logger,
  tokenResponse,
  resolvedOffer,
  clientId,
  pidSchemes,
}: ReissueWithAccessTokenInput): Promise<W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined> {
  if (!agent) {
    throw new Error('Agent is required to get OpenID credential using access token.')
  }

  if (!resolvedOffer) {
    throw new Error('Either offerUri or resolvedOffer must be provided to get OpenID credential using access token.')
  }

  const resolvedCredentialOffer = resolvedOffer

  const authServers = resolvedCredentialOffer.metadata.credentialIssuerMetadata.authorization_servers
  // const authServer = authServers?.[0]
  const credentialIssuer = resolvedCredentialOffer.metadata.issuer
  const authServer = credentialIssuer
  const configID = getCredentialConfigurationIds(resolvedCredentialOffer)?.[0]
  const tokenEndpoint = resolvedCredentialOffer.metadata.token_endpoint
  const issuerMetadata = resolvedCredentialOffer.metadata.credentialIssuerMetadata
  const credentialEndpoint = resolvedCredentialOffer.metadata.credential_endpoint

  if (!configID) {
    throw new Error('No credential configuration ID found in the credential offer metadata')
  }
  if (!authServer) {
    throw new Error('No authorization server found in the credential offer metadata')
  }
  if (!credentialIssuer) {
    throw new Error('No credential issuer found in the credential offer metadata')
  }

  const refreshToken = tokenResponse.refresh_token

  if (!refreshToken) {
    throw new Error('No refresh token found in the token response.')
  }

  const credential = await receiveCredentialFromOpenId4VciOffer({
    agent,
    resolvedCredentialOffer,
    tokenResponse: tokenResponse,
    clientId,
    pidSchemes,
  })

  // console.log(' #### [useOpenID] Received credential from OpenID4VCI offer:', JSON.stringify(credential))

  if (refreshToken && authServer) {
    // console.log(' #### [useOpenID] Setting refresh metadata for credential:', JSON.stringify(gg))
    setRefreshCredentialMetadata(credential, {
      authServer: authServer,
      tokenEndpoint: tokenEndpoint,
      refreshToken: refreshToken,
      issuerMetadataCache: {
        credential_issuer: credentialIssuer,
        credential_endpoint: credentialEndpoint,
        token_endpoint: tokenEndpoint,
        authorization_servers: authServers,
        credential_configurations_supported: issuerMetadata?.credential_configurations_supported,
      },
      credentialIssuer: credentialIssuer,
      credentialConfigurationId: configID,
      lastCheckedAt: Date.now(),
      lastCheckResult: 'valid',
      attemptCount: 0,
      resolvedCredentialOffer: resolvedCredentialOffer,
    })
  }

  return credential
}
  */
