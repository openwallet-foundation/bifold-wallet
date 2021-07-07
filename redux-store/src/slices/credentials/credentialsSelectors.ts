import { CredentialState } from 'aries-framework'
import { CredentialsState } from './credentialsSlice'

interface PartialCredentialState {
  credentials: CredentialsState
}

/**
 * Namespace that holds all CredentialRecord related selectors.
 */
namespace CredentialsSelectors {
  /**
   * Selector that retrieves the entire **credentials** store object.
   */
  export const credentialsStateSelector = (state: PartialCredentialState) => state.credentials.credentials

  /**
   * Selector that retrieves all CredentialRecords from the store.
   */
  export const credentialRecordsSelector = (state: PartialCredentialState) => state.credentials.credentials.records

  /**
   * Selector that retrieves all CredentialRecords from the store by specified credential state.
   */
  export const credentialsRecordsByStateSelector = (credentialState: CredentialState) => (
    state: PartialCredentialState
  ) => state.credentials.credentials.records.filter((record) => record.state === credentialState)

  /**
   * Selector that fetches a CredentialRecord by id from the state.
   */
  export const connectionRecordByIdSelector = (credentialRecordId: string) => (state: PartialCredentialState) =>
    state.credentials.credentials.records.find((x) => x.id === credentialRecordId)
}

export { CredentialsSelectors }
