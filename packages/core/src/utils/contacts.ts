import { DidCommBasicMessageRecord, DidCommConnectionRecord, DidCommCredentialExchangeRecord, DidCommProofExchangeRecord } from '@credo-ts/didcomm'
import { BifoldAgent } from './agent'

interface ConnectionWithMessages {
  conn: DidCommConnectionRecord
  msgs: (DidCommBasicMessageRecord | DidCommCredentialExchangeRecord | DidCommProofExchangeRecord)[]
}

interface ConnectionWithLatestMessage {
  conn: DidCommConnectionRecord
  latestMsg: DidCommBasicMessageRecord | DidCommCredentialExchangeRecord | DidCommProofExchangeRecord
}

/**
 * Function to fetch contacts (connections) in order of latest chat message without using hooks
 * @param agent - Credo agent
 * @returns ConnectionRecord[] sorted by most recent message
 */
export const fetchContactsByLatestMessage = async (
  agent: BifoldAgent,
  connections: DidCommConnectionRecord[]
): Promise<DidCommConnectionRecord[]> => {
  const connectionsWithMessages = await Promise.all<ConnectionWithMessages>(
    connections.map(
      async (conn: DidCommConnectionRecord): Promise<ConnectionWithMessages> => ({
        conn,
        msgs: [
          ...(await agent.modules.basicMessages.findAllByQuery({ connectionId: conn.id })),
          ...(await agent.modules.proofs.findAllByQuery({ connectionId: conn.id })),
          ...(await agent.modules.credentials.findAllByQuery({ connectionId: conn.id })),
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
        { createdAt: pair.conn.createdAt } as DidCommBasicMessageRecord | DidCommCredentialExchangeRecord | DidCommProofExchangeRecord
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
