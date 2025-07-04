import { Agent, MediationRecord } from '@credo-ts/core'
import Config from 'react-native-config'
import { parse } from 'query-string'
import { Buffer } from 'buffer'

const validateMediatorUrl = async (url?: string): Promise<boolean> => {
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

const parseMediatorInvitation = (url: string): Record<string, any> | null => {
  const query = url.split('?')[1] || ''
  const { c_i, oob } = parse(query)
  const encoded = typeof c_i === 'string' ? c_i : typeof oob === 'string' ? oob : null
  if (!encoded) {
    return null
  }
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  const decoded = Buffer.from(base64, 'base64').toString('utf-8')

  return JSON.parse(decoded)
}

export const isMediatorInvitation = async (agent: Agent, url: string): Promise<boolean> => {
  const invitation = parseMediatorInvitation(url)
  if (!invitation) {
    return false
  }
  agent.config.logger.info(`base64 parsed invitation: ${JSON.stringify(invitation, null, 2)}`)
  const type = invitation['@type'] ?? invitation['type'] ?? ''
  if (!type.includes('connections/1.0/invitation') && !type.includes('connections/2.0/invitation')) {
    agent.config.logger.warn(`Invalid invitation type: ${type}`)
    return false
  }
  // const goalCode = invitation['goal_code'] ?? ''
  // if (!goalCode.includes('aries.vc.mediate')) {
  //   agent.config.logger.warn(`Goal code: ${goalCode} is not a valid mediator invitataion`)
  //   return false
  // }

  return true
}

const getConnectionRecordFromMediatorUrl = async (agent: Agent, url: string): Promise<MediationRecord | undefined> => {
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
  const mediationRecord = await getConnectionRecordFromMediatorUrl(agent, mediatorUrl)
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
