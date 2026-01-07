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
  OpenId4VciCredentialResponse,
  OpenId4VciCredentialSupportedWithId,
  OpenId4VciDeferredCredentialResponse,
  OpenId4VciDpopRequestOptions,
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

  if (!tokenResponse.access_token) {
    throw new Error('No access token found in the token response for re-issuance.')
  }

  logger.info('*** Starting to get new credential via re-issuance flow ***')
  // Request a **new** credential using the *existing* configuration id
  type credsRet = {
    credentials: OpenId4VciCredentialResponse[]
    deferredCredentials: OpenId4VciDeferredCredentialResponse[]
    dpop?: OpenId4VciDpopRequestOptions
    cNonce?: string
  }

  const creds: credsRet = await agent.modules.openid4vc.holder.requestCredentials({
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

  // Normalize to your local record types
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
