import { Agent, ConnectionRecord, ConnectionType } from '@credo-ts/core'
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

export const getMediatorConnection = async (agent: Agent): Promise<ConnectionRecord | undefined> => {
  const connections: ConnectionRecord[] = await agent.connections.getAll()
  const mediators = connections.filter((r) => r.connectionTypes.includes(ConnectionType.Mediator))
  if (mediators.length < 1) {
    agent.config.logger.warn(`Mediator connection not found`)
    return undefined
  }

  // get most recent mediator connection
  const latestMediator = mediators.reduce((acc, cur) => {
    if (!acc.updatedAt) {
      if (!cur.updatedAt) {
        return acc.createdAt > cur.createdAt ? acc : cur
      } else {
        return acc.createdAt > cur.updatedAt ? acc : cur
      }
    }

    if (!cur.updatedAt) {
      return acc.updatedAt > cur.createdAt ? acc : cur
    } else {
      return acc.updatedAt > cur.updatedAt ? acc : cur
    }
  }, mediators[0])

  return latestMediator
}

export const isMediatorCapable = async (agent: Agent): Promise<boolean | undefined> => {
  const mediator = await getMediatorConnection(agent)
  if (!mediator) {
    return
  }
  agent.config.logger.info(`Mediator connection record: ${JSON.stringify(mediator, null, 2)}`)
  const connectionTypes = mediator.connectionTypes ?? mediator.getTags?.()?.connectionTypes
  const isMediator = Array.isArray(connectionTypes) && connectionTypes.includes('mediator')

  return isMediator
}

export const getConnectionIdFromMediatorUrl = async (agent: Agent, mediatorUrl: string): Promise<string | null> => {
  try {
    const invite = await agent.oob.parseInvitation(mediatorUrl)
    let outOfBandRecord = await agent.oob.findByReceivedInvitationId(invite.id)

    if (!outOfBandRecord) {
      const { outOfBandRecord: newOobRecord } = await agent.oob.receiveInvitation(invite)
      outOfBandRecord = newOobRecord
    }
    const [connection] = await agent.connections.findAllByOutOfBandId(outOfBandRecord.id)
    const readyConnection = connection?.isReady
      ? connection
      : connection
      ? await agent.connections.returnWhenIsConnected(connection.id)
      : null

    return readyConnection?.id ?? null
  } catch (error) {
    agent.config.logger.warn(`Failed to get connection ID from mediator URL: ${error}`)
    return null
  }
}

export const parseMediatorInvitation = (agent: Agent, url: string): Record<string, any> | null => {
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
    agent.config.logger.warn(`Failed to parse mediator invitation: ${e}`)
    return null
  }
}

export const isMediatorInvitation = async (agent: Agent, url: string): Promise<boolean> => {
  const invitation = parseMediatorInvitation(agent, url)
  if (!invitation) {
    return false
  }
  const capable = await isMediatorCapable(agent)
  return !!capable
}

export const setMediationToDefault = async (agent: Agent, mediatorUrl: string) => {
  const connectionId = await getConnectionIdFromMediatorUrl(agent, mediatorUrl)
  agent.config.logger.info(`Setting mediation to default for connection ID: ${connectionId}`)
  if (!connectionId) {
    return
  }
  const currentDefault = await agent.mediationRecipient.findDefaultMediator()
  if (currentDefault?.connectionId === connectionId) {
    return
  }
  let mediationRecord = await agent.mediationRecipient.findByConnectionId(connectionId)
  agent.config.logger.info(`Mediation record found: ${!!mediationRecord}`)
  if (!mediationRecord) {
    agent.config.logger.info(`mediation record failed to find. Requesting mediation for connection ID: ${connectionId}`)
    const connection = await agent.connections.findById(connectionId)
    if (!connection) {
      agent.config.logger.warn(`Connection with ID ${connectionId} not found`)
      return
    }
    agent.config.logger.info(`Requesting mediation for connection: ${connection.id}`)
    mediationRecord = await agent.mediationRecipient.requestMediation(connection)
  }
  await agent.mediationRecipient.setDefaultMediator(mediationRecord)
  agent.config.logger.info(`setting default mediator with record: ${JSON.stringify(mediationRecord)}`)
}
