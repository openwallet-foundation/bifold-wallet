import { ConnectionRecord, OutOfBandRecord } from '@credo-ts/core'
import { useAgent, useConnectionById, useConnections } from '@credo-ts/react-hooks'
import { useMemo, useState } from 'react'

export const useOutOfBandById = (oobId: string): OutOfBandRecord | undefined => {
  const { agent } = useAgent()
  const [oob, setOob] = useState<OutOfBandRecord | undefined>(undefined)
  if (!oob) {
    agent?.oob.findById(oobId).then((res) => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}

export const useConnectionByOutOfBandId = (outOfBandId: string): ConnectionRecord | undefined => {
  const reuseConnectionId = useOutOfBandById(outOfBandId)?.reuseConnectionId
  const { records: connections } = useConnections()

  return useMemo(
    () =>
      connections.find(
        (connection: ConnectionRecord) =>
          connection.outOfBandId === outOfBandId ||
          // Check for a reusable connection
          (reuseConnectionId && connection.id === reuseConnectionId)
      ),
    [connections, outOfBandId, reuseConnectionId]
  )
}

export const useOutOfBandByConnectionId = (connectionId: string): OutOfBandRecord | undefined => {
  const connection = useConnectionById(connectionId)
  return useOutOfBandById(connection?.outOfBandId ?? '')
}
