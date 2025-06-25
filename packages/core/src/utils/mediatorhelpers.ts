import { Agent, ConnectionRecord, ConnectionType } from '@credo-ts/core'
import Config from 'react-native-config'

export const validateMediatorUrl = async (url?: string): Promise<boolean> => {
  if (!url) return false
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export const getMediatorUrl = async (selectedMediator: string): Promise<string> => {
  const resolved = (await validateMediatorUrl(selectedMediator)) ? selectedMediator : Config.MEDIATOR_URL!
  return resolved
}

export const getConnectionRecordFromMediatorUrl = async (agent: Agent, url: string): Promise<ConnectionRecord | undefined> => {
  try {
    const invitation = await agent.oob.parseInvitation(url)
    console.log(`Parsed invitation: ${JSON.stringify(invitation, null, 2)}`)
    if (!invitation) {
      agent.config.logger.warn(`No invitation found in URL: ${url}`)
      return undefined
    }
    let outOfBandRecord = await agent.oob.findByReceivedInvitationId(invitation.id)
    
    if (!outOfBandRecord) {
      const { outOfBandRecord: newOobRecord } = await agent.oob.receiveInvitation(invitation)
      outOfBandRecord = newOobRecord
    }
    console.log(`Out of band record: ${JSON.stringify(outOfBandRecord, null, 2)}`)
    const [connection] = await agent.connections.findAllByOutOfBandId(outOfBandRecord.id)
    const result = connection.isReady ? connection : await agent.connections.returnWhenIsConnected(connection.id)
    console.log(`Connection record: ${JSON.stringify(result, null, 2)}`)
    return result
  } catch (error) {
    agent.config.logger.warn(`Failed to get connection ID from mediator URL: ${error}`)
    return
  }
}

export const isMediatorInvitation = async (agent: Agent, url: string): Promise<boolean> => {
  const invitation = await getConnectionRecordFromMediatorUrl(agent, url)
  if (!invitation) {
    return false
  }
  console.log(`Parsed mediator invitation: ${JSON.stringify(invitation, null, 2)}`)
  agent.config.logger.info(`Has Mediator ID: ${!!invitation.mediatorId}`)
  return !!invitation.mediatorId
}

export const setMediationToDefault = async (agent: Agent, mediatorUrl: string) => {
  let connectionRecord = await getConnectionRecordFromMediatorUrl(agent, mediatorUrl)
  agent.config.logger.info(`Setting mediation to default for connection ID: ${connectionRecord?.id}`)
  if (!connectionRecord) {
    agent.config.logger.warn(`No connection record found for mediator URL: ${mediatorUrl}`)
    return
  }
  const currentDefault = await agent.mediationRecipient.findDefaultMediator()
  if (currentDefault?.connectionId === connectionRecord.id) {
    agent.config.logger.info(`Default mediator already set for connection ID: ${connectionRecord.id}`)
    return
  }
  let mediationRecord = await agent.mediationRecipient.findByConnectionId(connectionRecord.id)
  agent.config.logger.info(`Mediation record found: ${!!mediationRecord}`)
  if (!mediationRecord) {
    agent.config.logger.info(`mediation record failed to find. Requesting mediation for connection ID: ${connectionRecord.id}`)
    const connect = await agent.connections.findById(connectionRecord.id)
    if (!connect) {
      agent.config.logger.warn(`Connection not found for ID: ${connectionRecord.id}`)
      return
    }
    agent.config.logger.info(`Requesting mediation for connection: ${connectionRecord.id}`)
    mediationRecord = await agent.mediationRecipient.requestMediation(connect)
  }

  await agent.mediationRecipient.setDefaultMediator(mediationRecord) 
  // agent.config.logger.info(`Provisioning mediation for connection ID: ${connectionRecord.id}`)
  // await agent.mediationRecipient.provision(connectionRecord)
  console.log(`setting default mediator with record: ${JSON.stringify(mediationRecord)}`)
}
