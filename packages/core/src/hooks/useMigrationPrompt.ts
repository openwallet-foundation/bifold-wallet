/**
 * useMigrationPrompt Hook
 * 
 * Manages migration prompt state and logic.
 * Checks migration status on mount and provides callbacks for user actions.
 * 
 * @module useMigrationPrompt
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getMigrationStatus,
  incrementPostponeCount,
  isMigrationDeadlinePassed,
  getDaysUntilMigrationDeadline,
} from '../services/MigrationDetection'

export interface UseMigrationPromptResult {
  /** Whether to show the migration prompt */
  showPrompt: boolean
  /** Number of times user has postponed */
  postponeCount: number
  /** Days remaining until deadline */
  daysRemaining: number | null
  /** Whether deadline has passed */
  deadlinePassed: boolean
  /** Whether migration is needed */
  needsMigration: boolean
  /** Callback when user accepts migration */
  handleAccept: () => void
  /** Callback when user postpones migration */
  handlePostpone: () => void
  /** Manually hide the prompt */
  hidePrompt: () => void
}

/**
 * Hook to manage migration prompt state
 * 
 * @param onMigrationAccepted - Callback when user accepts migration
 * @returns Migration prompt state and callbacks
 * 
 * @example
 * ```typescript
 * const {
 *   showPrompt,
 *   postponeCount,
 *   daysRemaining,
 *   deadlinePassed,
 *   handleAccept,
 *   handlePostpone,
 * } = useMigrationPrompt(() => {
 *   navigation.navigate('MigrationFlow')
 * })
 * ```
 */
export function useMigrationPrompt(
  onMigrationAccepted: () => void
): UseMigrationPromptResult {
  const [showPrompt, setShowPrompt] = useState(false)
  const [postponeCount, setPostponeCount] = useState(0)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [needsMigration, setNeedsMigration] = useState(false)

  // Check migration status on mount
  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      // Get migration status
      const status = await getMigrationStatus()
      
      setNeedsMigration(status.needsMigration)
      setPostponeCount(status.postponeCount)

      // If migration not needed, don't show prompt
      if (!status.needsMigration) {
        setShowPrompt(false)
        return
      }

      // Check deadline
      const deadlinePassed = await isMigrationDeadlinePassed(90) // 90 days = 3 months
      const daysRemaining = await getDaysUntilMigrationDeadline(90)

      setDeadlinePassed(deadlinePassed)
      setDaysRemaining(daysRemaining)

      // Show prompt if:
      // 1. Migration is needed AND
      // 2. (Deadline passed OR user hasn't postponed 3 times yet)
      const shouldShow = status.needsMigration && (deadlinePassed || status.postponeCount < 3)
      setShowPrompt(shouldShow)
    } catch (error) {
      console.error('Error checking migration status:', error)
      setShowPrompt(false)
    }
  }

  const handleAccept = useCallback(() => {
    setShowPrompt(false)
    onMigrationAccepted()
  }, [onMigrationAccepted])

  const handlePostpone = useCallback(async () => {
    try {
      // Increment postpone count
      const newCount = await incrementPostponeCount()
      setPostponeCount(newCount)

      // Hide prompt
      setShowPrompt(false)

      // If user has postponed 3 times, they won't see prompt again until deadline
      if (newCount >= 3) {
        console.log('User has postponed migration 3 times. Will show again at deadline.')
      }
    } catch (error) {
      console.error('Error postponing migration:', error)
      setShowPrompt(false)
    }
  }, [])

  const hidePrompt = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return {
    showPrompt,
    postponeCount,
    daysRemaining,
    deadlinePassed,
    needsMigration,
    handleAccept,
    handlePostpone,
    hidePrompt,
  }
}

export default useMigrationPrompt
