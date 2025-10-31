/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClaimFormat } from '@credo-ts/core'
import { createStore } from 'zustand/vanilla'

export type CredId = string

export interface OpenIDCredentialLite {
  id: CredId
  format: ClaimFormat
  createdAt?: string
  issuer?: string
}

export interface ReplacementMap {
  [oldId: CredId]: OpenIDCredentialLite // the new “offer”/replacement
}

export interface RefreshingMap {
  [id: CredId]: true
}

/** Permanent (until unblocked) blocks so the orchestrator won’t retry this cred again this session */
export type BlockReason = 'succeeded' | 'failed'

export interface BlockEntry {
  reason: BlockReason
  at: string
  error?: string
}

export interface RegistryState {
  // source of truth for creds you care about
  byId: Record<CredId, OpenIDCredentialLite>
  // expired/invalid originals that have a replacement available
  expired: CredId[]
  // mapping old -> new
  replacements: ReplacementMap
  // marker to avoid parallel refresh of same cred
  refreshing: RefreshingMap
  // creds that should no longer be refreshed (either success or failed previously)
  blocked: Record<CredId, BlockEntry>
  // last run timestamps (optional, helps UI)
  lastSweepAt?: string
}

export interface RegistryActions {
  upsert: (cred: OpenIDCredentialLite) => void

  markRefreshing: (id: CredId) => void
  clearRefreshing: (id: CredId) => void

  /** Old cred `oldId` has a replacement available (offer or reissued record) */
  markExpiredWithReplacement: (oldId: CredId, replacement: OpenIDCredentialLite) => void

  /** Accept the queued replacement for oldId → promotes replacement to byId and clears expired state */
  acceptReplacement: (oldId: CredId) => void

  /** Clear “expired” tag for a cred (e.g., verifier says valid again) */
  clearExpired: (id: CredId) => void

  /** Mark this cred permanently blocked due to success (no more attempts needed) */
  blockAsSucceeded: (id: CredId) => void

  /** Mark this cred permanently blocked due to failure (don’t hammer issuer again) */
  blockAsFailed: (id: CredId, error?: string) => void

  /** Remove any block for this cred (e.g., debug/manual override) */
  unblock: (id: CredId) => void

  /** Central gate used by the orchestrator to decide whether to skip */
  shouldSkip: (id: CredId) => boolean

  setLastSweep: (iso: string) => void
  reset: () => void
}

export type RegistryStore = RegistryState & RegistryActions

export const credentialRegistry = createStore<RegistryStore>((set, get) => ({
  byId: {},
  expired: [],
  replacements: {},
  refreshing: {},
  blocked: {},
  lastSweepAt: undefined,

  upsert: (cred) => set((s) => ({ byId: { ...s.byId, [cred.id]: cred } })),

  markRefreshing: (id) => set((s) => ({ refreshing: { ...s.refreshing, [id]: true } })),

  clearRefreshing: (id) =>
    set((s) => {
      const { [id]: _drop, ...rest } = s.refreshing
      return { refreshing: rest }
    }),

  markExpiredWithReplacement: (oldId, replacement) =>
    set((s) => ({
      expired: s.expired.includes(oldId) ? s.expired : [...s.expired, oldId],
      replacements: { ...s.replacements, [oldId]: replacement },
    })),

  acceptReplacement: (oldId) =>
    set((s) => {
      const repl = s.replacements[oldId]
      if (!repl) return s
      const byId = { ...s.byId }
      delete byId[oldId]
      byId[repl.id] = repl
      const { [oldId]: _drop, ...restRepl } = s.replacements
      return {
        byId,
        replacements: restRepl,
        expired: s.expired.filter((x) => x !== oldId),
        // Once accepted, you can optionally block the oldId as succeeded:
        blocked: { ...s.blocked, [oldId]: { reason: 'succeeded', at: new Date().toISOString() } },
      }
    }),

  clearExpired: (id) =>
    set((s) => ({
      expired: s.expired.filter((x) => x !== id),
    })),

  blockAsSucceeded: (id) =>
    set((s) => ({
      blocked: { ...s.blocked, [id]: { reason: 'succeeded', at: new Date().toISOString() } },
    })),

  blockAsFailed: (id, error) =>
    set((s) => ({
      blocked: { ...s.blocked, [id]: { reason: 'failed', at: new Date().toISOString(), error } },
    })),

  unblock: (id) =>
    set((s) => {
      const { [id]: _drop, ...rest } = s.blocked
      return { blocked: rest }
    }),

  shouldSkip: (id) => {
    const s = get()
    if (s.refreshing[id]) return true // in-progress
    if (s.expired.includes(id)) return true // replacement already queued
    if (s.blocked[id]) return true // previously succeeded/failed
    return false
  },

  setLastSweep: (iso) => set({ lastSweepAt: iso }),

  reset: () =>
    set({
      byId: {},
      expired: [],
      replacements: {},
      refreshing: {},
      blocked: {},
      lastSweepAt: undefined,
    }),
}))

// Non-React helpers for workers/services
export const readRegistry = () => credentialRegistry.getState()
export const mutateRegistry = (updater: (s: RegistryStore) => void) =>
  credentialRegistry.setState((s) => {
    updater(s)
    return s
  })

export const selectOldIdByReplacementId = (replacementId: string): string | undefined => {
  const { replacements } = credentialRegistry.getState()
  for (const [oldId, repl] of Object.entries(replacements)) {
    if (repl.id === replacementId) return oldId
  }
  return undefined
}
