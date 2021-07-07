import { ProofState } from 'aries-framework'
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
   * Selector that retrieves all ProofRecords from the state.
   */
  export const proofRecordsSelector = (state: PartialProofsState) => state.proofs.proofs.records

  /**
   * Selector that retrieves all ProofRecords from the store by specified state.
   */
  export const proofRecordsByStateSelector = (proofState: ProofState) => (state: PartialProofsState) =>
    state.proofs.proofs.records.filter((record) => record.state === proofState)

  /**
   * Selector that fetches a ProofRecord by id from the state.
   */
  export const connectionRecordByIdSelector = (proofRecordId: string) => (state: PartialProofsState) =>
    state.proofs.proofs.records.find((x) => x.id === proofRecordId)
}

export { ProofsSelectors }
