import {
  AnonCredsDidCommCredentialFormatService,
  AnonCredsModule,
  AnonCredsDidCommProofFormatService,
  DataIntegrityDidCommCredentialFormatService,
  LegacyIndyDidCommCredentialFormatService,
  LegacyIndyDidCommProofFormatService,
  DidCommCredentialV1Protocol,
  DidCommProofV1Protocol,
} from '@credo-ts/anoncreds'
import { AskarModule } from '@credo-ts/askar'
import {
  Agent,
  DidsModule,
  JwkDidResolver,
  KeyDidResolver,
  PeerDidResolver,
  WebDidResolver,
} from '@credo-ts/core'

import { 
  DidCommAutoAcceptCredential, 
  DidCommAutoAcceptProof, 
  DidCommConnectionsModule, 
  DidCommCredentialsModule,
  DidCommMediationRecipientModule,
  DidCommMediatorPickupStrategy,
  DidCommProofsModule,
  DidCommCredentialV2Protocol,
  DidCommProofV2Protocol, 
  DidCommDifPresentationExchangeProofFormatService,
  DidCommModule,
  DidCommOutOfBandModule} from '@credo-ts/didcomm'

import { IndyVdrAnonCredsRegistry, IndyVdrModule, IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import { OpenId4VcHolderModule } from '@credo-ts/openid4vc'
import { PushNotificationsApnsModule, PushNotificationsFcmModule } from '@credo-ts/push-notifications'
import { WebVhAnonCredsRegistry, WebvhDidResolver } from '@credo-ts/webvh'
import { useAgent } from '@bifold/react-hooks'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { askar } from '@openwallet-foundation/askar-react-native'
import { indyVdr } from '@hyperledger/indy-vdr-react-native'

interface GetAgentModulesOptions {
  indyNetworks: IndyVdrPoolConfig[]
  mediatorInvitationUrl?: string
  txnCache?: { capacity: number; expiryOffsetMs: number; path?: string }
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>

/**
 * Constructs the modules to be used in the agent setup
 * @param indyNetworks
 * @param mediatorInvitationUrl determine which mediator to use
 * @param txnCache optional local cache config for indyvdr
 * @returns modules to be used in agent setup
 */
export function getAgentModules({ indyNetworks, mediatorInvitationUrl, txnCache }: GetAgentModulesOptions) {
  const indyCredentialFormat = new LegacyIndyDidCommCredentialFormatService()
  const indyProofFormat = new LegacyIndyDidCommProofFormatService()

  if (txnCache) {
    indyVdr.setLedgerTxnCache({
      capacity: txnCache.capacity,
      expiry_offset_ms: txnCache.expiryOffsetMs,
      path: txnCache.path,
    })
  }

  return {
    askar: new AskarModule({
      ariesAskar: askar,
    }),
    anoncreds: new AnonCredsModule({
      anoncreds,
      registries: [new IndyVdrAnonCredsRegistry(), new WebVhAnonCredsRegistry()],
    }),
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks: indyNetworks as [IndyVdrPoolConfig],
    }),
    connections: new DidCommConnectionsModule({
      autoAcceptConnections: true,
    }),
    credentials: new DidCommCredentialsModule({
      autoAcceptCredentials: DidCommAutoAcceptCredential.ContentApproved,
      credentialProtocols: [
        new DidCommCredentialV1Protocol({ indyCredentialFormat }),
        new DidCommCredentialV2Protocol({
          credentialFormats: [
            indyCredentialFormat,
            new AnonCredsDidCommCredentialFormatService(),
            new DataIntegrityDidCommCredentialFormatService(),
          ],
        }),
      ],
    }),
    proofs: new DidCommProofsModule({
      autoAcceptProofs: DidCommAutoAcceptProof.ContentApproved,
      proofProtocols: [
        new DidCommProofV1Protocol({ indyProofFormat }),
        new DidCommProofV2Protocol({
          proofFormats: [
            indyProofFormat,
            new AnonCredsDidCommProofFormatService(),
            new DidCommDifPresentationExchangeProofFormatService(),
          ],
        }),
      ],
    }),
    mediationRecipient: new DidCommMediationRecipientModule({
      mediatorInvitationUrl: mediatorInvitationUrl,
      mediatorPickupStrategy: DidCommMediatorPickupStrategy.Implicit,
    }),
    //pushNotificationsFcm: new PushNotificationsFcmModule(),
    //pushNotificationsApns: new PushNotificationsApnsModule(),
    didcomm: new DidCommModule(),
    openId4VcHolder: new OpenId4VcHolderModule(),
    dids: new DidsModule({
      resolvers: [
        new WebvhDidResolver(),
        new WebDidResolver(),
        new JwkDidResolver(),
        new KeyDidResolver(),
        new PeerDidResolver(),
      ],
    }),
    oob: new DidCommOutOfBandModule()
  }
}

interface MyAgentContextInterface {
  loading: boolean
  agent: BifoldAgent
}

export const useAppAgent = useAgent as () => MyAgentContextInterface

export const createLinkSecretIfRequired = async (agent: Agent) => {
  // If we don't have any link secrets yet, we will create a
  // default link secret that will be used for all anoncreds
  // credential requests.
  const linkSecretIds = await agent.modules.anoncreds.getLinkSecretIds()
  if (linkSecretIds.length === 0) {
    await agent.modules.anoncreds.createLinkSecret({
      setAsDefault: true,
    })
  }
}
