// services/AgentBridge.ts
import type { Agent } from '@credo-ts/core'

type ReadyListener = (agent: Agent) => void
type ClosedListener = (reason?: string) => void
type ChangeListener = (agent: Agent | undefined) => void

export class AgentBridge {
  private agent?: Agent

  // one-shot listeners (cleared after first setAgent)
  private readyOnce: ReadyListener[] = []
  // persistent listeners (fire on every setAgent)
  private readyPersistent = new Set<ReadyListener>()

  private closedListeners: ClosedListener[] = []
  private changeListeners: ChangeListener[] = []

  /** Set the live agent (e.g., after PIN unlock) */
  setAgent(agent: Agent) {
    this.agent = agent
    this.readyOnce.forEach((l) => l(agent))
    this.readyOnce = []
    this.readyPersistent.forEach((l) => l(agent))
    this.changeListeners.forEach((l) => l(agent))
  }

  /** Clear the current agent (e.g., on wallet lock / shutdown) */
  clearAgent(reason?: string) {
    if (!this.agent) return
    this.agent = undefined
    this.closedListeners.forEach((l) => l(reason))
    this.changeListeners.forEach((l) => l(undefined))
  }

  /**
   * Ready subscription.
   * - Default (persistent = false): one-shot (old behavior). If agent exists, fires immediately.
   * - Persistent (persistent = true): fires now if ready and on every subsequent setAgent.
   */
  onReady(fn: ReadyListener, persistent = false): () => void {
    if (persistent) {
      this.readyPersistent.add(fn)
      if (this.agent) fn(this.agent)
      return () => this.readyPersistent.delete(fn)
    }

    if (this.agent) {
      fn(this.agent)
      return () => void 0
    }
    this.readyOnce.push(fn)
    return () => {
      this.readyOnce = this.readyOnce.filter((f) => f !== fn)
    }
  }

  /** Persistent: called whenever agent becomes available or cleared */
  onChange(fn: ChangeListener): () => void {
    this.changeListeners.push(fn)
    // Emit current state immediately
    fn(this.agent)
    return () => {
      this.changeListeners = this.changeListeners.filter((f) => f !== fn)
    }
  }

  /** Persistent: called when agent is cleared (lock/shutdown) */
  onClosed(fn: ClosedListener): () => void {
    this.closedListeners.push(fn)
    return () => {
      this.closedListeners = this.closedListeners.filter((f) => f !== fn)
    }
  }

  /** Promise helper to await an agent (one-shot) */
  waitForReady(): Promise<Agent> {
    return new Promise<Agent>((resolve) => {
      const unsub = this.onReady((a) => {
        unsub?.()
        resolve(a)
      })
    })
  }

  get current(): Agent | undefined {
    return this.agent
  }

  get isReady(): boolean {
    return !!this.agent
  }
}
