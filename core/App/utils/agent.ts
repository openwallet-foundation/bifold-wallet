import {
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@aries-framework/anoncreds'
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
import { IndySdkModule, IndySdkPoolConfig } from '@aries-framework/indy-sdk'
import { useAgent } from '@aries-framework/react-hooks'
import * as indySdk from 'indy-sdk-react-native'

interface GetAgentModulesOptions {
  indyNetworks: IndySdkPoolConfig[]
  mediatorInvitationUrl?: string
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
export function getAgentModules({ indyNetworks, mediatorInvitationUrl }: GetAgentModulesOptions) {
  const indyCredentialFormat = new LegacyIndyCredentialFormatService()
  const indyProofFormat = new LegacyIndyProofFormatService()

  return {
    indySdk: new IndySdkModule({
      indySdk,
      networks: indyNetworks,
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

export const useAppAgent = useAgent() as unknown as () => MyAgentContextInterface
