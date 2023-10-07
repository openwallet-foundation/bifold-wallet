import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@aries-framework/anoncreds'
import {
  Agent,
  ConnectionsModule,
  CredentialsModule,
  MediationRecipientModule,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
} from '@aries-framework/core'

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
        | V2CredentialProtocol<(LegacyIndyCredentialFormatService | AnonCredsCredentialFormatService)[]>
      )[]
    >
    proofs: ProofsModule<
      (V1ProofProtocol | V2ProofProtocol<(LegacyIndyProofFormatService | AnonCredsProofFormatService)[]>)[]
    >
    mediationRecipient: MediationRecipientModule
  }
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
