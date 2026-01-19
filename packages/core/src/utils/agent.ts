import {
  AnonCredsDidCommCredentialFormatService,
  AnonCredsDidCommProofFormatService,
  AnonCredsModule,
  DataIntegrityDidCommCredentialFormatService,
  DidCommCredentialV1Protocol,
  DidCommProofV1Protocol,
  LegacyIndyDidCommCredentialFormatService,
  LegacyIndyDidCommProofFormatService,
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
  DidCommCredentialV2Protocol,
  DidCommProofV2Protocol, 
  DidCommDifPresentationExchangeProofFormatService,
  DidCommModule,
  DidCommMediatorPickupStrategy
} from '@credo-ts/didcomm'

import { IndyVdrAnonCredsRegistry, IndyVdrModule, IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import { OpenId4VcHolderModule, OpenId4VcModule } from '@credo-ts/openid4vc'
// import { PushNotificationsApnsModule, PushNotificationsFcmModule } from '@credo-ts/push-notifications'
import { WebVhAnonCredsRegistry, WebVhDidResolver } from '@credo-ts/webvh'
import { useAgent } from '@credo-ts/react-hooks'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { askar } from '@openwallet-foundation/askar-react-native'
import { indyVdr } from '@hyperledger/indy-vdr-react-native'

interface GetAgentModulesOptions {
  indyNetworks: IndyVdrPoolConfig[]
  mediatorInvitationUrl?: string
  txnCache?: { capacity: number; expiryOffsetMs: number; path?: string }
}

export type BifoldAgentModules = ReturnType<typeof getAgentModules>

export type BifoldAgent = Agent<BifoldAgentModules>

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
    // TODO: Not a function?
    // indyVdr.setLedgerTxnCache({
    //   capacity: txnCache.capacity,
    //   expiry_offset_ms: txnCache.expiryOffsetMs,
    //   path: txnCache.path,
    // })
  }

  const askarStoreValue = 'bifoldAskar';

  return {
    anoncreds: new AnonCredsModule({
      anoncreds,
      registries: [new IndyVdrAnonCredsRegistry(), new WebVhAnonCredsRegistry()],
    }),
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks: indyNetworks as [IndyVdrPoolConfig],
    }),
    didcomm: new DidCommModule({
      connections: {
        autoAcceptConnections: true,
      },
      credentials: {
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
      },
      proofs: {
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
      },
      mediationRecipient: {
        mediatorInvitationUrl: mediatorInvitationUrl,
        mediatorPickupStrategy: DidCommMediatorPickupStrategy.PickUpV2,
      },
    }),
    openid4vc: new OpenId4VcModule(),
    // oob: new DidCommOutOfBandModule(),
    // basicMessages: new DidCommBasicMessagesModule(),
    askar: new AskarModule({
      askar,
      store: { id: askarStoreValue, key: askarStoreValue },
    }),
    dids: new DidsModule({
      resolvers: [
        new WebVhDidResolver(),
        new WebDidResolver(),
        new JwkDidResolver(),
        new KeyDidResolver(),
        new PeerDidResolver(),
      ],
    }),
  }
}

interface MyAgentContextInterface {
  loading: boolean
  agent: BifoldAgent
}

export const useAppAgent = useAgent as () => MyAgentContextInterface

export const createLinkSecretIfRequired = async (agent: BifoldAgent) => {
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
