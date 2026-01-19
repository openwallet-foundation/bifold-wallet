
import { DidCommConnectionRecord, DidCommOutOfBandRecord } from '@credo-ts/didcomm'
import { useConnectionById, useConnections } from '@credo-ts/react-hooks'
import { useMemo, useState } from 'react'
import { useAppAgent } from '../utils/agent'

export const useOutOfBandById = (oobId: string): DidCommOutOfBandRecord | undefined => {
  const { agent } = useAppAgent()
  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)
  if (!oob) {
    agent?.modules.didcomm.oob.findById(oobId).then((res) => {
      if (res) {
        setOob(res)
      }
    })
  }
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
