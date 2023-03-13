import { Agent, V1RequestPresentationMessage } from '@aries-framework/core'

export const indyProofName = async (agent: Agent | undefined, proofId: string): Promise<string> => {
  if (agent) {
    return agent.proofs.findRequestMessage(proofId).then((message) => {
      if (message instanceof V1RequestPresentationMessage && message.indyProofRequest) {
        return message.indyProofRequest.name
      } else {
        return ''
      }
    })
  } else return Promise.resolve('')
}
