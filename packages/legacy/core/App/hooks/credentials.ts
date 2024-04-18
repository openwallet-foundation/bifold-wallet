import { CredentialExchangeRecord } from '@credo-ts/core'
import { useCredentials } from '@credo-ts/react-hooks'
import { useMemo } from 'react'

export const useCredentialsByConnectionId = (connectionId: string): CredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()
  return useMemo(
    () => credentials.filter((credential: CredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId]
  )
}
