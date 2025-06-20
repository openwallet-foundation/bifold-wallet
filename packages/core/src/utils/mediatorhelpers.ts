import { Agent } from '@credo-ts/core'
import Config from 'react-native-config'
import { parse } from 'query-string'
import { Buffer } from 'buffer'

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

export const getConnectionIdFromMediatorUrl = async (agent: Agent, mediatorUrl: string): Promise<string | null> => {
  try {
    const invite = await agent.oob.parseInvitation(mediatorUrl)
    const outOfBandRecord = await agent.oob.findByReceivedInvitationId(invite.id)
    let [connection] = outOfBandRecord ? await agent.connections.findAllByOutOfBandId(outOfBandRecord.id) : []
    if (!connection) {
      const fallbackInvite = await agent.oob.parseInvitation(Config.MEDIATOR_URL!)
      const { connectionRecord: newConnection } = await agent.oob.receiveInvitation(fallbackInvite)
      if (!newConnection) {
        return null
      }
      connection = newConnection
    }
    const readyConnection = connection.isReady
      ? connection
      : await agent.connections.returnWhenIsConnected(connection.id)
    return readyConnection.id
  } catch (error) {
    agent.config.logger.warn(`Failed to get connection ID from mediator URL: ${error}`)
    return null
  }
}

export const parseMediatorInvitation = (url: string): Record<string, any> | null => {
  if (!url.includes('c_i=')) {
    return null
  }
  try {
    const { c_i: encoded } = parse(url.split('?')[1] || '')
    if (typeof encoded !== 'string') {
      return null
    }
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

export const isMediatorInvitation = async (url: string): Promise<boolean> => {
  const invitation = parseMediatorInvitation(url)
  if (!invitation) {
    return false
  }
  const labelCheck = typeof invitation.label === 'string' && invitation.label.toLowerCase().includes('mediator')
  const hasRoutingKeys = Array.isArray(invitation.routingKeys) && invitation.routingKeys.length > 0
  if (!labelCheck || !hasRoutingKeys) {
    return false
  }
  return true
}

export const setMediationToDefault = async (agent: Agent, mediatorUrl: string) => {
  const connectionId = await getConnectionIdFromMediatorUrl(agent, mediatorUrl)
  if (!connectionId) {
    return
  }
  const currentDefault = await agent.mediationRecipient.findDefaultMediator()
  if (currentDefault?.connectionId === connectionId) {
    return
  }
  let mediationRecord = await agent.mediationRecipient.findByConnectionId(connectionId)
  if (!mediationRecord) {
    const connection = await agent.connections.findById(connectionId)
    if (!connection) {
      return
    }
    mediationRecord = await agent.mediationRecipient.requestMediation(connection)
  }
  await agent.mediationRecipient.setDefaultMediator(mediationRecord)
}
