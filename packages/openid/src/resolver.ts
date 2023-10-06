import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  AnonCredsProofRequestRestriction,
  AnonCredsSelectedCredentials,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@aries-framework/anoncreds'
import { AnonCredsCredentialMetadataKey } from '@aries-framework/anoncreds/build/utils/metadata'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { AskarModule } from '@aries-framework/askar'
import {
  CredentialFormat,
  OutOfBandRecord,
  GetCredentialFormatDataReturn,
  ConnectionRecord,
  CredentialEventTypes,
  RevocationNotificationReceivedEvent,
  Agent,
  ConsoleLogger,
  WsOutboundTransport,
  HttpOutboundTransport,
  CredentialState,
  CredentialPreviewAttribute,
  CredentialExchangeRecord,
  ProofState,
  ProofExchangeRecord,
  AcceptCredentialOfferOptions as AcceptOfferOptions,
  DidExchangeState,
  OutOfBandInvitation,
  ConnectionInvitationMessage,
  ReceiveOutOfBandInvitationConfig,
  CredentialPreviewAttributeOptions,
  DeleteCredentialOptions,
  GetProofFormatDataReturn,
  ProofsModule,
  V2ProofProtocol,
  MediationRecipientModule,
  V2CredentialProtocol,
  CredentialsModule,
  ConnectionsModule,
  SelectCredentialsForProofRequestReturn,
  GetCredentialsForProofRequestReturn,
  GetCredentialsForProofRequestOptions,
  KeyDidCreateOptions,
  KeyType,
  W3cCredentialService,
  W3cCredentialRecord,
  DefaultProofProtocols,
  ProofFormatPayload,
  DidKey,
  JwaSignatureAlgorithm,
} from '@aries-framework/core'

import { OpenId4VcClientModule } from '@aries-framework/openid4vc-client'

export class ResolveOpenID4VCICred {
  private bundle: OverlayBundle
  private options: OCABundleResolverOptions

  public constructor(bundle: OverlayBundle, options?: OCABundleResolverOptions) {
    this.bundle = bundle
    this.options = {
      brandingOverlayType: options?.brandingOverlayType ?? BrandingOverlayType.Branding10,
      language: options?.language ?? 'en',
    }
  }

async function requestPreAuthorizedOpenIdCredential(agent: Agent, issuerUri: string) {
    try {
      if (!agent) {
        log(`[${AgentProviderWrapper.name}]: Request pre-authorized OpenId credential: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set `)
      }
      const did = await agent.dids.create<KeyDidCreateOptions>({
        method: 'key',
        options: {
          keyType: KeyType.Ed25519,
        },
      })
      if (
        !did.didState.didDocument ||
        !did.didState.didDocument.authentication ||
        did.didState.didDocument.authentication.length === 0
      ) {
        throw new Error("Error creating did document, or did document has no 'authentication' verificationMethods")
      }

      const didKey = DidKey.fromDid(did.didState.did as string)
      const kid = `${did.didState.did as string}#${didKey.key.fingerprint}`
      const verificationMethod = did.didState.didDocument?.dereferenceKey(kid, ['authentication'])
      if (!verificationMethod) throw new Error('No verification method found')

      log(`[${AgentProviderWrapper.name}]: Grabing w3cCredentialRecords ..`, LogLevel.trace)
      const w3cCredentialRecords =
        await agent.modules.openId4VcClient.requestCredentialUsingPreAuthorizedCode({
          issuerUri: issuerUri,
          verifyCredentialStatus: false,
          allowedProofOfPossessionSignatureAlgorithms: [JwaSignatureAlgorithm.EdDSA],
          proofOfPossessionVerificationMethodResolver: () => verificationMethod,
        })
      log(`[${AgentProviderWrapper.name}]: Records ${JSON.stringify(w3cCredentialRecords)}`, LogLevel.trace)
      // Extract key identified (kid) for authentication verification method
      // const [verificationMethod] = did.didState.didDocument.authentication
      // const kid = typeof verificationMethod === 'string' ? verificationMethod : verificationMethod.id
      // const response = await agentState.agent.modules.openId4VcClient.requestCredentialUsingPreAuthorizedCode({
      //   issuerUri,
      //   kid,
      //   checkRevocationState: false,
      // })
      await fetchW3CCredentialRecord()
      return w3cCredentialRecords
    } catch (e: unknown) {
      log(`[${AgentProviderWrapper.name}]: Request pre-authorized OpenId credential: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }

  async function fetchW3CCredentialRecord() {
    try {
      if (!agentState.agent) {
        log(`[${AgentProviderWrapper.name}]: Fetch W3C credentials: Agent not set`, LogLevel.error)
        throw new Error(`Agent not set `)
      }
      const w3cCredentialService = await agentState.agent.dependencyManager.resolve(W3cCredentialService)
      const record = await w3cCredentialService.getAllCredentialRecords(agentState.agent.context)
      setW3cCredentials(record)
      return record
    } catch (e: unknown) {
      log(`[${AgentProviderWrapper.name}]: Fetch W3C credentials: ${e}`, LogLevel.error)
      throw new Error(`${e}`)
    }
  }
}
