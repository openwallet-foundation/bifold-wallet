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

const parseInvitationUrl = (url: string): Record<string, any> | null => {
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
  const invitation = parseInvitationUrl(url)
  if (!invitation) {
    return false
  }

  agent.config.logger.info(`Parsed invitation: ${JSON.stringify(invitation, null, 2)}`)

  const type = invitation['@type'] ?? invitation['type'] ?? ''
  const isValidType = type.includes('connections/1.0/invitation') || type.includes('out-of-band/1.1/invitation')
  if (!isValidType) {
    agent.config.logger.warn(`Invalid invitation type: ${type}`)
    return false
  }

  const goalCode = invitation['goal_code'] ?? ''
  const isMediatorGoal = goalCode.includes('aries.vc.mediate')
  if (!isMediatorGoal) {
    agent.config.logger.warn(`Invalid mediator goal code: ${goalCode}`)
    return false
  }

  return true
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
