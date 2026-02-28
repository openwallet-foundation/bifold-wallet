import { DidCommCredentialExchangeRecord } from '@credo-ts/didcomm'
import { useCredentials } from '@bifold/react-hooks'
import { useMemo } from 'react'

export const useCredentialsByConnectionId = (connectionId: string): DidCommCredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()
  return useMemo(
    () => credentials.filter((credential: DidCommCredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId]
  )
}
