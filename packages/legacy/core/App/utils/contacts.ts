import { BasicMessageRecord, ConnectionRecord, CredentialExchangeRecord, ProofExchangeRecord } from '@credo-ts/core'

import { BifoldAgent } from './agent'

interface ConnectionWithMessages {
  conn: ConnectionRecord
  msgs: (BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord)[]
}

interface ConnectionWithLatestMessage {
  conn: ConnectionRecord
  latestMsg: BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord
}

/**
 * Function to fetch contacts (connections) in order of latest chat message without using hooks
 * @param agent - Credo agent
 * @returns ConnectionRecord[] sorted by most recent message
 */
export const fetchContactsByLatestMessage = async (agent: BifoldAgent): Promise<ConnectionRecord[]> => {
  const connections = await agent.connections.getAll()
  const connectionsWithMessages = await Promise.all<ConnectionWithMessages>(
    connections.map(
      async (conn: ConnectionRecord): Promise<ConnectionWithMessages> => ({
        conn,
        msgs: [
          ...(await agent.basicMessages.findAllByQuery({ connectionId: conn.id })),
          ...(await agent.proofs.findAllByQuery({ connectionId: conn.id })),
          ...(await agent.credentials.findAllByQuery({ connectionId: conn.id })),
        ],
      })
    )
  )

  const connectionsWithLatestMessage: ConnectionWithLatestMessage[] = connectionsWithMessages.map((pair) => {
    return {
      conn: pair.conn,
      latestMsg: pair.msgs.reduce(
        (acc, cur) => {
          const accDate = acc.updatedAt || acc.createdAt
          const curDate = cur.updatedAt || cur.createdAt
          return accDate > curDate ? acc : cur
        },
        // Initial value if no messages exist for this connection is a placeholder with the date the connection was created
        { createdAt: pair.conn.createdAt } as BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord
      ),
    }
  })

  return connectionsWithLatestMessage
    .sort(
      (a, b) =>
        new Date(b.latestMsg.updatedAt || b.latestMsg.createdAt).valueOf() -
        new Date(a.latestMsg.updatedAt || a.latestMsg.createdAt).valueOf()
    )
    .map((pair) => pair.conn)
}
