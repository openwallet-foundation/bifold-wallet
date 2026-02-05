import { ConnectionRecord, OutOfBandRecord } from '@credo-ts/core'
import { useAgent, useConnectionById, useConnections } from '@bifold/react-hooks'
import { useEffect, useMemo, useState } from 'react'

export const useOutOfBandById = (oobId: string): OutOfBandRecord | undefined => {
  const { agent } = useAgent()
  const [oob, setOob] = useState<OutOfBandRecord | undefined>(undefined)

  useEffect(() => {
    if (!oobId || !agent) {
      setOob(undefined)
      return
    }

    agent.oob
      .findById(oobId)
      .then((res) => {
        setOob(res ?? undefined)
      })
      .catch(() => {
        setOob(undefined)
      })
  }, [oobId, agent])

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
