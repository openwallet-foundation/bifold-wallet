import { useAgent, useConnectionById, useConnections } from '@bifold/react-hooks'
import { DidCommConnectionRecord, DidCommOutOfBandRecord } from '@credo-ts/didcomm'
import { useEffect, useMemo, useState } from 'react'

export const useOutOfBandById = (oobId: string): DidCommOutOfBandRecord | undefined => {
  const { agent } = useAgent()
  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)

  useEffect(() => {
    if (!oobId || !agent) {
      setOob(undefined)
      return
    }

    agent.modules.didcomm.oob
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

export const useConnectionByOutOfBandId = (outOfBandId: string): DidCommConnectionRecord | undefined => {
  const reuseConnectionId = useOutOfBandById(outOfBandId)?.reuseConnectionId
  const { records: connections } = useConnections()

  return useMemo(
    () =>
      connections.find(
        (connection: DidCommConnectionRecord) =>
          connection.outOfBandId === outOfBandId ||
          // Check for a reusable connection
          (reuseConnectionId && connection.id === reuseConnectionId)
      ),
    [connections, outOfBandId, reuseConnectionId]
  )
}

export const useOutOfBandByConnectionId = (connectionId: string): DidCommOutOfBandRecord | undefined => {
  const connection = useConnectionById(connectionId)
  return useOutOfBandById(connection?.outOfBandId ?? '')
}
