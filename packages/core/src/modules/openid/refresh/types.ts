import {
  ClaimFormat,
  JwaSignatureAlgorithm,
  JwkJson,
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
} from '@credo-ts/core'
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

export interface RefreshCredentialMetadata {
  // issuer & config to re-issue the same cred
  authServer: string
  tokenEndpoint: string
  refreshToken: string
  credentialIssuer: string
  credentialConfigurationId: string
  issuerMetadataCache: IssuerMetadataCache
  clientId?: string
  tokenBinding?: 'DPoP' | 'Bearer'
  dpop?: { alg: JwaSignatureAlgorithm; jwk: JwkJson }

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
  onError?: (e: unknown) => void
  listRecords?: () => Promise<any[]>
  toLite?: (rec: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => {
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
  resolveFull(id: string): W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
}

export enum OpenIDCustomNotificationType {
  CredentialReplacementAvailable = 'CustomNotificationOpenIDCredential',
}
