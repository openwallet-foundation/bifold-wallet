import { Agent, MediationRecord } from '@credo-ts/core'

export const isMediatorInvitation = async (agent: Agent, url: string): Promise<boolean> => {
  const invitation = await agent.oob.parseInvitation(url)
  if (!invitation) {
    return false
  }
  if (invitation.goalCode === 'aries.vc.mediate') {
    agent.config.logger.info(`Invitation is a mediator invitation with goal code: ${invitation.goalCode}`)
    return true
  }
  agent.config.logger.info(`Invitation is not a mediator invitation, goal code: ${invitation.goalCode}`)
  return false
}

const provisionMediationRecordFromMediatorUrl = async (
  agent: Agent,
  url: string
): Promise<MediationRecord | undefined> => {
  try {
    const invitation = await agent.oob.parseInvitation(url)
    if (!invitation) {
      agent.config.logger.warn(`No invitation found in URL: ${url}`)
      return undefined
    }
    const outOfBandRecord = await agent.oob.findByReceivedInvitationId(invitation.id)
    let [connection] = outOfBandRecord ? await agent.connections.findAllByOutOfBandId(outOfBandRecord.id) : []

    if (!connection) {
      agent.config.logger.warn(`No connection found for out-of-band record: ${outOfBandRecord?.id}`)
      const invite = await agent.oob.parseInvitation(url)
      const { connectionRecord: newConnection } = await agent.oob.receiveInvitation(invite)
      if (!newConnection) {
        agent.config.logger.warn(`Failed to create connection from invitation: ${JSON.stringify(invite, null, 2)}`)
        return
      }
      connection = newConnection
    }
    const result = connection.isReady ? connection : await agent.connections.returnWhenIsConnected(connection.id)
    return agent.mediationRecipient.provision(result)
  } catch (error) {
    agent.config.logger.warn(`Failed to get connection ID from mediator URL: ${error}`)
    return
  }
}

export const setMediationToDefault = async (agent: Agent, mediatorUrl: string) => {
  const mediationRecord = await provisionMediationRecordFromMediatorUrl(agent, mediatorUrl)
  if (!mediationRecord) {
    agent.config.logger.warn(`No connection record found for mediator URL: ${mediatorUrl}`)
    return
  }
  const currentDefault = await agent.mediationRecipient.findDefaultMediator()
  if (currentDefault?.connectionId === mediationRecord.id) {
    agent.config.logger.info(`Default mediator already set for connection ID: ${mediationRecord.id}`)
    return
  }
  await agent.mediationRecipient.setDefaultMediator(mediationRecord)
  agent.config.logger.info(`setting default mediator with record: ${JSON.stringify(mediationRecord)}`)
}
