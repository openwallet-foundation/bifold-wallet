// Temp until fixed in AFJ
import '@hyperledger/aries-askar-react-native'
import '@hyperledger/anoncreds-react-native'
import '@hyperledger/indy-vdr-react-native'

import {
  AnonCredsModule,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { AskarModule } from '@aries-framework/askar'
import {
  Agent,
  AutoAcceptCredential,
  ConnectionsModule,
  CredentialsModule,
  MediatorPickupStrategy,
  ProofsModule,
  RecipientModule,
  V2CredentialProtocol,
  V2ProofProtocol,
} from '@aries-framework/core'
import { IndyVdrAnonCredsRegistry, IndyVdrModule, IndyVdrPoolConfig } from '@aries-framework/indy-vdr'
import { useAgent } from '@aries-framework/react-hooks'

interface GetAgentModulesOptions {
  indyNetworks: IndyVdrPoolConfig[]
  mediatorInvitationUrl?: string
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
export function getAgentModules({ indyNetworks, mediatorInvitationUrl }: GetAgentModulesOptions) {
  const indyCredentialFormat = new LegacyIndyCredentialFormatService()
  const indyProofFormat = new LegacyIndyProofFormatService()

  return {
    askar: new AskarModule(),
    anoncredsRs: new AnonCredsRsModule(),
    anoncreds: new AnonCredsModule({
      registries: [new IndyVdrAnonCredsRegistry()],
    }),
    indyVdr: new IndyVdrModule({
      networks: indyNetworks as [IndyVdrPoolConfig],
    }),
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      credentialProtocols: [
        new V1CredentialProtocol({ indyCredentialFormat }),
        new V2CredentialProtocol({
          credentialFormats: [indyCredentialFormat],
        }),
      ],
    }),
    proofs: new ProofsModule({
      proofProtocols: [
        new V1ProofProtocol({ indyProofFormat }),
        new V2ProofProtocol({
          proofFormats: [indyProofFormat],
        }),
      ],
    }),
    mediationRecipient: new RecipientModule({
      mediatorInvitationUrl: mediatorInvitationUrl,
      mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
    }),
  }
}

interface MyAgentContextInterface {
  loading: boolean
  agent?: BifoldAgent
  setAgent: (agent?: BifoldAgent) => void
}

export const useAppAgent = useAgent as () => MyAgentContextInterface
