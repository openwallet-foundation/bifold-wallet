import {
  AnonCredsDidCommCredentialFormat,
  AnonCredsModule,
  AnonCredsDidCommProofFormatService,
  DataIntegrityDidCommCredentialFormatService,
  LegacyIndyDidCommCredentialFormatService,
  LegacyIndyDidCommProofFormatService,
  DidCommCredentialV1Protocol,
  DidCommProofV1Protocol,
  AnonCredsDidCommCredentialFormatService,
} from '@credo-ts/anoncreds'

import {
  Agent
} from '@credo-ts/core'

import {
  DidCommConnectionsModule,
  DidCommCredentialsModule,
  DidCommDifPresentationExchangeProofFormatService,
  DidCommMediationRecipientModule,
  DidCommProofsModule,
  DidCommCredentialV2Protocol,
  DidCommProofV2Protocol,
  DidCommOutOfBandModule
} from '@credo-ts/didcomm'

function getAgentModules() {
  return null as unknown as {
    //askar: AskarModule
    //anoncredsRs: AnonCredsRsModule
    anoncreds: AnonCredsModule
    //indyVdr: IndyVdrModule
    oob: DidCommOutOfBandModule
    connections: DidCommConnectionsModule
    credentials: DidCommCredentialsModule<
      (
        | DidCommCredentialV1Protocol
        | DidCommCredentialV2Protocol<
            (
              | LegacyIndyDidCommCredentialFormatService
              | AnonCredsDidCommCredentialFormatService
              | DataIntegrityDidCommCredentialFormatService
            )[]
          >
      )[]
    >
    proofs: DidCommProofsModule<
      (
        | DidCommProofV1Protocol
        | DidCommProofV2Protocol<
            (LegacyIndyDidCommProofFormatService | AnonCredsDidCommProofFormatService | DidCommDifPresentationExchangeProofFormatService)[]
          >
      )[]
    >
    mediationRecipient: DidCommMediationRecipientModule
  }
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
