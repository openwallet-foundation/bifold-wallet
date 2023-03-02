// import { LegacyIndyCredentialFormatService, LegacyIndyProofFormatService } from '@aries-framework/anoncreds'
import { Agent } from '@aries-framework/core'
import { IndySdkModule } from '@aries-framework/indy-sdk'
import { useAgent } from '@aries-framework/react-hooks'

export const myModules = {
  indySdk: new IndySdkModule(),
  // credentials: new CredentialsModule({
  //   credentialProtocols: [
  //     // new V1CredentialProtocol({ indyCredentialFormat: new LegacyIndyCredentialFormatService() }),
  //     new V2CredentialProtocol({
  //       credentialFormats: [
  //         new LegacyIndyCredentialFormatService(),
  //         // new AnonCredsCredentialFormatService(),
  //         // // new JsonLdCredentialFormat(),
  //       ],
  //     }),
  //   ],
  // }),
  // proofs: new ProofsModule({
  //   proofProtocols: [
  //     new V2ProofProtocol({
  //       proofFormats: [
  //         new LegacyIndyProofFormatService(),
  //         // new AnonCredsProofFormat(),
  //         // new PresentationExchangeProofFormat(),
  //       ],
  //     }),
  //   ],
  // }),
}

interface MyAgentContextInterface {
  loading: boolean
  agent?: Agent<typeof myModules>
  setAgent: (agent?: Agent<typeof myModules>) => void
}

export const useAppAgent = useAgent() as unknown as () => MyAgentContextInterface
