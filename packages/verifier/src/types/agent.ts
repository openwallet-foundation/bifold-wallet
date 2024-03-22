import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  DataIntegrityCredentialFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@credo-ts/anoncreds'
import {
  Agent,
  ConnectionsModule,
  CredentialsModule,
  DifPresentationExchangeProofFormatService,
  MediationRecipientModule,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
} from '@credo-ts/core'

function getAgentModules() {
  return null as unknown as {
    //askar: AskarModule
    //anoncredsRs: AnonCredsRsModule
    anoncreds: AnonCredsModule
    //indyVdr: IndyVdrModule
    connections: ConnectionsModule
    credentials: CredentialsModule<
      (
        | V1CredentialProtocol
        | V2CredentialProtocol<
            (
              | LegacyIndyCredentialFormatService
              | AnonCredsCredentialFormatService
              | DataIntegrityCredentialFormatService
            )[]
          >
      )[]
    >
    proofs: ProofsModule<
      (
        | V1ProofProtocol
        | V2ProofProtocol<
            (LegacyIndyProofFormatService | AnonCredsProofFormatService | DifPresentationExchangeProofFormatService)[]
          >
      )[]
    >
    mediationRecipient: MediationRecipientModule
  }
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
