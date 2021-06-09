import { CredentialState, ProofState } from 'aries-framework'
import { ProofsState } from './proofsSlice'

interface PartialProofsState {
  proofs: ProofsState
}

/**
 * Namespace that holds all ProofRecords related selectors.
 */
namespace ProofsSelectors {
  /**
   * Selector that retrieves the entire **proofs** store object.
   */
  export const proofsStateSelector = (state: PartialProofsState) => state.proofs.proofs

  /**
   * Selector that retrieves the entire **proofRequest** store object.
   */
  export const proofRequestStateSelector = (state: PartialProofsState) => state.proofs.proofRequest

  /**
   * Selector that retrieves the entire **presentationProposal** store object.
   */
  export const presentationProposalStateSelector = (state: PartialProofsState) => state.proofs.presentationProposal

  /**
   * Selector the latest error regarding the **credentials** slice.
   */
  export const latestCredentialErrorSelector = (state: PartialProofsState) => state.proofs.latestError

  /**
   * Namespace that holds selectors that fetch ProofRecords from the store
   * based on their current state.
   */
  export namespace ProofRecordStateSelectors {
    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **proposal-sent** state.
     */
    export const proposalSentSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.ProposalSent)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **proposal-received** state.
     */
    export const proposalReceivedSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.PresentationReceived)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **request-sent** state.
     */
    export const requestSentSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.RequestSent)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **request-received** state.
     */
    export const requestReceivedSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.RequestReceived)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **presentation-sent** state.
     */
    export const presentationSentSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.PresentationSent)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **presentation-received** state.
     */
    export const presentationReceivedSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.PresentationReceived)

    /**
     * Selector to retrieve all ProofRecords from the store that have the
     * **done** state.
     */
    export const doneSelector = (state: PartialProofsState) =>
      state.proofs.proofs.records.filter((x) => x.state === ProofState.Done)
  }
}

export { ProofsSelectors }
