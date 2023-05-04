import { ConnectionRecord } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { useMemo } from 'react'

export const useConnectionByOutOfBandId = (outOfBandId: string): ConnectionRecord | undefined => {
  const { records: connections } = useConnections()
  return useMemo(
    () => connections.find((connection: ConnectionRecord) => connection.outOfBandId === outOfBandId),
    [connections, outOfBandId]
  )
}
