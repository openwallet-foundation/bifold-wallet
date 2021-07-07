import { EnhancedStore } from '@reduxjs/toolkit'
import { ProofEventTypes, ProofStateChangedEvent } from 'aries-framework'
import { Agent } from 'aries-framework'
import { proofsSlice } from './proofsSlice'

/**
 * Starts an EventListener that listens for ProofRecords state changes
 * and updates the store accordingly.
 *
 * This function **must** be called if you're working with ProofRecords.
 * If you don't, the store won't be updated.
 */
const startProofsListener = (agent: Agent, store: EnhancedStore) => {
  const listener = (event: ProofStateChangedEvent) => {
    const record = event.payload.proofRecord
    store.dispatch(proofsSlice.actions.updateOrAdd(record))
  }

  agent.events.on(ProofEventTypes.ProofStateChanged, listener)

  return () => {
    agent.events.off(ProofEventTypes.ProofStateChanged, listener)
  }
}

export { startProofsListener }
