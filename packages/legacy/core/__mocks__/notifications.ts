import { CredentialExchangeRecord as CredentialRecord, ProofExchangeRecord } from '@credo-ts/core'

type Notifications = {
  total: number
  notifications: Array<CredentialRecord | ProofExchangeRecord>
}

export const useNotifications = (): Notifications => {
  return { total: 0, notifications: [] }
}
