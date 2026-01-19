import { Agent } from '@credo-ts/core'
import { DidCommMediationRecord } from '@credo-ts/didcomm'

export const isMediatorInvitation = async (agent: Agent, url: string): Promise<boolean> => {
  try {
    const invitation = await agent.modules.didcomm.oob.parseInvitation(url)
    if (!invitation) {
      return false
    }

    if (invitation.goalCode === 'aries.vc.mediate') {
      agent.config.logger.info(`Invitation is a mediator invitation with goal code: ${invitation.goalCode}`)
      return true
    }

    return false
  } catch (error) {
    agent.config.logger.error(`Invitation is not a mediator invitation.`, error as Error)
    return false
  }
}

const provisionMediationRecordFromMediatorUrl = async (
  agent: Agent,
  url: string
): Promise<DidCommMediationRecord | undefined> => {
  try {
    const invitation = await agent.modules.didcomm.oob.parseInvitation(url)
    if (!invitation) {
      agent.config.logger.error(`No invitation found in URL: ${url}`)
      return undefined
    }

    const outOfBandRecord = await agent.modules.didcomm.oob.findByReceivedInvitationId(invitation.id)
    let [connection] = outOfBandRecord ? await agent.modules.didcomm.connections.findAllByOutOfBandId(outOfBandRecord.id) : []

    if (!connection) {
      agent.config.logger.warn(`No connection found for out-of-band record: ${outOfBandRecord?.id}`)
      const invite = await agent.modules.didcomm.oob.parseInvitation(url)
      const { connectionRecord: newConnection } = await agent.modules.didcomm.oob.receiveInvitation(invite)

      if (!newConnection) {
        agent.config.logger.error(`Failed to create connection from invitation: ${JSON.stringify(invite, null, 2)}`)
        return
      }
      connection = newConnection
    }

    const result = connection.isReady ? connection : await agent.modules.didcomm.connections.returnWhenIsConnected(connection.id)
    return agent.modules.didcomm.mediationRecipient.provision(result)
  } catch (error) {
    agent.config.logger.error(`Failed to get connection ID from mediator URL: ${error}`)
    return
  }
}

export const setMediationToDefault = async (agent: Agent, mediatorUrl: string) => {
  const mediationRecord = await provisionMediationRecordFromMediatorUrl(agent, mediatorUrl)
  if (!mediationRecord) {
    agent.config.logger.error(`No connection record found for mediator URL: ${mediatorUrl}`)
    return
  }

  const currentDefault = await agent.modules.didcomm.mediationRecipient.findDefaultMediator()
  if (currentDefault?.connectionId === mediationRecord.id) {
    agent.config.logger.info(`Default mediator already set for connection ID: ${mediationRecord.id}`)
    return
  }

  await agent.modules.didcomm.mediationRecipient.setDefaultMediator(mediationRecord)
  agent.config.logger.info(`setting default mediator with record: ${JSON.stringify(mediationRecord)}`)
}
