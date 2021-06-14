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
   * Selector that retrieves the entire **proposal** store object.
   */
  export const proposalStateSelector = (state: PartialCredentialState) => state.credentials.proposal

  /**
   * Namespace that holds selectors that fetch CredentialRecords from the store
   * based on their current state.
   */
  export namespace CredentialRecordStateSelectors {
    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **proposal-sent** state.
     */
    export const proposalSentSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.ProposalSent)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **proposal-received** state.
     */
    export const proposalReceivedSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.ProposalReceived)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **offer-sent** state.
     */
    export const offerSentSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.OfferSent)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **offer-received** state.
     */
    export const offerReceivedSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.OfferReceived)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **request-sent** state.
     */
    export const requestSentSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.RequestSent)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **request-received** state.
     */
    export const requestReceivedSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.RequestReceived)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **credential-issued** state.
     */
    export const credentialIssuedSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.CredentialIssued)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **credential-received** state.
     */
    export const credentialReceivedSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.CredentialReceived)

    /**
     * Selector to retrieve all CredentialRecords from the store that have the
     * **done** state.
     */
    export const doneSelector = (state: PartialCredentialState) =>
      state.credentials.credentials.records.filter((x) => x.state === CredentialState.Done)
  }
}

export { CredentialsSelectors }
