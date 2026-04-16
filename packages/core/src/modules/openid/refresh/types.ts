import { ClaimFormat, MdocRecord, SdJwtVcRecord, W3cCredentialRecord, W3cV2CredentialRecord } from '@credo-ts/core'
import { KnownJwaSignatureAlgorithm } from '@credo-ts/core/build/modules/kms/jwk/jwa.mjs'
import { Jwk } from '@credo-ts/core/build/modules/kms/jwk/jwk.mjs'
import { OpenId4VciResolvedCredentialOffer } from '@credo-ts/openid4vc'

export type IssuerMetadataCache = {
  credential_issuer: string
  credential_endpoint?: string
  token_endpoint?: string
  authorization_servers?: string[]
  credential_configurations_supported?: Record<string, any>
  // optionally: added_at, etag, updated_at, etc.
}

export enum RefreshStatus {
  Valid = 'valid',
  Invalid = 'invalid',
  Error = 'error',
}

/**
 * Controls how invalid OpenID credentials are handled after status checks.
 * - InvalidThenOnDemand: show invalid notification; replacement is attempted on user action.
 * - FullReplacement: orchestrator attempts replacement immediately and surfaces replacement notification when available.
 */
export enum OpenIDCredentialRefreshFlowType {
  InvalidThenOnDemand = 'invalid-then-on-demand',
  FullReplacement = 'full-replacement',
}

export interface RefreshCredentialMetadata {
  tokenEndpoint: string
  refreshToken: string
  credentialIssuer: string
  credentialConfigurationId: string
  issuerMetadataCache: IssuerMetadataCache
  clientId?: string
  tokenBinding?: 'DPoP' | 'Bearer'
  dpop?: { alg: KnownJwaSignatureAlgorithm; jwk: Jwk }

  // refresh lifecycle
  lastCheckedAt?: number
  lastCheckResult?: RefreshStatus
  attemptCount?: number
  nextEligibleAt?: number

  // linking (optional)
  supersededByID?: string
  supersedesID?: string
  resolvedCredentialOffer?: OpenId4VciResolvedCredentialOffer
}

export type RefreshOrchestratorOpts = {
  intervalMs?: number | null
  autoStart?: boolean
  flowType?: OpenIDCredentialRefreshFlowType
  onError?: (e: unknown) => void
  listRecords?: () => Promise<any[]>
  toLite?: (rec: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord) => {
    id: string
    format: ClaimFormat
    createdAt?: string
    issuer?: string
  }
}

export interface IRefreshOrchestrator {
  configure(opts: Partial<RefreshOrchestratorOpts>): void
  start(): void
  stop(): void
  runOnce(reason?: string): Promise<void>
  isRunning(): boolean
  resolveFull(id: string): W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord | undefined
}

export enum OpenIDCustomNotificationType {
  CredentialReplacementAvailable = 'CustomNotificationOpenIDCredential',
  CredentialExpired = 'CredentialExpired',
}
