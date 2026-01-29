/**
 * MigrationDetection Service
 * 
 * Detects whether a wallet needs migration from old format (PIN-based) to new format (mnemonic-based).
 * Tracks migration status and provides utilities for migration workflow.
 * 
 * Old Format:
 * - Wallet key derived from PIN using PBKDF2
 * - No mnemonic stored
 * - Cannot restore on different device without backup file
 * 
 * New Format:
 * - Wallet key derived from BIP39 mnemonic
 * - Mnemonic encrypted with PIN and stored in keychain
 * - Can restore on any device with mnemonic + backup file
 * 
 * @module MigrationDetection
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { hasMnemonicInKeychain } from './MnemonicStorage'
import { loadWalletSalt } from './keychain'

/**
 * Wallet format types
 */
export enum WalletFormat {
  /** Old format: PIN-based wallet key derivation */
  OLD = 'old',
  /** New format: Mnemonic-based wallet key derivation */
  NEW = 'new',
  /** No wallet exists */
  NONE = 'none',
}

/**
 * Migration status
 */
export interface MigrationStatus {
  /** Whether migration is needed */
  needsMigration: boolean
  /** Current wallet format */
  walletFormat: WalletFormat
  /** Whether migration has been completed */
  migrationCompleted: boolean
  /** Number of times user postponed migration */
  postponeCount: number
  /** Timestamp when migration was completed (if applicable) */
  completedAt?: number
  /** Timestamp when user was first prompted for migration */
  firstPromptedAt?: number
}

// AsyncStorage keys
const MIGRATION_STATUS_KEY = '@BifoldWallet:MigrationStatus'
const MIGRATION_COMPLETED_KEY = '@BifoldWallet:MigrationCompleted'
const MIGRATION_POSTPONE_COUNT_KEY = '@BifoldWallet:MigrationPostponeCount'
const MIGRATION_FIRST_PROMPTED_KEY = '@BifoldWallet:MigrationFirstPrompted'

/**
 * Get current wallet format
 * 
 * Determines whether the wallet is using old format (PIN-based) or new format (mnemonic-based).
 * 
 * Detection logic:
 * 1. Check if mnemonic exists in keychain → NEW format
 * 2. Check if wallet salt exists (old wallet data) → OLD format
 * 3. Neither exists → NONE (no wallet)
 * 
 * @returns Current wallet format
 * 
 * @example
 * ```typescript
 * const format = await getWalletFormat()
 * if (format === WalletFormat.OLD) {
 *   // Show migration prompt
 * }
 * ```
 */
export async function getWalletFormat(): Promise<WalletFormat> {
  try {
    // Check if new format (mnemonic exists in keychain)
    const hasMnemonic = await hasMnemonicInKeychain()
    if (hasMnemonic) {
      return WalletFormat.NEW
    }

    // Check if old format (wallet salt exists)
    const walletSalt = await loadWalletSalt()
    if (walletSalt) {
      return WalletFormat.OLD
    }

    // No wallet exists
    return WalletFormat.NONE
  } catch (error) {
    console.error('Error detecting wallet format:', error)
    return WalletFormat.NONE
  }
}

/**
 * Check if wallet needs migration
 * 
 * A wallet needs migration if:
 * 1. It's in OLD format (PIN-based)
 * 2. Migration has not been completed yet
 * 
 * @returns true if migration is needed, false otherwise
 * 
 * @example
 * ```typescript
 * const needsMigration = await needsMigration()
 * if (needsMigration) {
 *   // Navigate to migration flow
 * }
 * ```
 */
export async function needsMigration(): Promise<boolean> {
  try {
    // Check wallet format
    const format = await getWalletFormat()
    
    // If no wallet or already new format, no migration needed
    if (format === WalletFormat.NONE || format === WalletFormat.NEW) {
      return false
    }

    // Check if migration already completed
    const completed = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY)
    if (completed === 'true') {
      return false
    }

    // Old format wallet exists and migration not completed
    return true
  } catch (error) {
    console.error('Error checking migration need:', error)
    return false
  }
}

/**
 * Mark migration as complete
 * 
 * Stores migration completion status in AsyncStorage.
 * This prevents showing migration prompts after successful migration.
 * 
 * @returns true if successfully marked, false otherwise
 * 
 * @example
 * ```typescript
 * // After successful migration
 * await markMigrationComplete()
 * ```
 */
export async function markMigrationComplete(): Promise<boolean> {
  try {
    const timestamp = Date.now()
    
    await AsyncStorage.multiSet([
      [MIGRATION_COMPLETED_KEY, 'true'],
      [MIGRATION_STATUS_KEY, JSON.stringify({ completedAt: timestamp })],
    ])

    return true
  } catch (error) {
    console.error('Error marking migration complete:', error)
    return false
  }
}

/**
 * Get complete migration status
 * 
 * Returns comprehensive migration status including:
 * - Whether migration is needed
 * - Current wallet format
 * - Migration completion status
 * - Postpone count
 * - Timestamps
 * 
 * @returns Complete migration status
 * 
 * @example
 * ```typescript
 * const status = await getMigrationStatus()
 * console.log(`Wallet format: ${status.walletFormat}`)
 * console.log(`Needs migration: ${status.needsMigration}`)
 * console.log(`Postponed ${status.postponeCount} times`)
 * ```
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  try {
    // Get wallet format
    const walletFormat = await getWalletFormat()

    // Get migration completion status
    const completed = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY)
    const migrationCompleted = completed === 'true'

    // Get postpone count
    const postponeCountStr = await AsyncStorage.getItem(MIGRATION_POSTPONE_COUNT_KEY)
    const postponeCount = postponeCountStr ? parseInt(postponeCountStr, 10) : 0

    // Get timestamps
    const statusStr = await AsyncStorage.getItem(MIGRATION_STATUS_KEY)
    const statusData = statusStr ? JSON.parse(statusStr) : {}
    
    const firstPromptedStr = await AsyncStorage.getItem(MIGRATION_FIRST_PROMPTED_KEY)
    const firstPromptedAt = firstPromptedStr ? parseInt(firstPromptedStr, 10) : undefined

    // Determine if migration is needed
    const needsMigrationFlag = 
      walletFormat === WalletFormat.OLD && !migrationCompleted

    return {
      needsMigration: needsMigrationFlag,
      walletFormat,
      migrationCompleted,
      postponeCount,
      completedAt: statusData.completedAt,
      firstPromptedAt,
    }
  } catch (error) {
    console.error('Error getting migration status:', error)
    
    // Return safe default
    return {
      needsMigration: false,
      walletFormat: WalletFormat.NONE,
      migrationCompleted: false,
      postponeCount: 0,
    }
  }
}

/**
 * Increment postpone count
 * 
 * Tracks how many times user has postponed migration.
 * Used to enforce migration after certain number of postpones.
 * 
 * @returns New postpone count
 * 
 * @example
 * ```typescript
 * const count = await incrementPostponeCount()
 * if (count >= 3) {
 *   // Force migration (no more postpone option)
 * }
 * ```
 */
export async function incrementPostponeCount(): Promise<number> {
  try {
    const currentStr = await AsyncStorage.getItem(MIGRATION_POSTPONE_COUNT_KEY)
    const current = currentStr ? parseInt(currentStr, 10) : 0
    const newCount = current + 1

    await AsyncStorage.setItem(MIGRATION_POSTPONE_COUNT_KEY, newCount.toString())

    // Set first prompted timestamp if not set
    const firstPrompted = await AsyncStorage.getItem(MIGRATION_FIRST_PROMPTED_KEY)
    if (!firstPrompted) {
      await AsyncStorage.setItem(MIGRATION_FIRST_PROMPTED_KEY, Date.now().toString())
    }

    return newCount
  } catch (error) {
    console.error('Error incrementing postpone count:', error)
    return 0
  }
}

/**
 * Reset migration tracking
 * 
 * Clears all migration-related data from AsyncStorage.
 * Used for testing or when starting fresh.
 * 
 * @returns true if successfully reset, false otherwise
 * 
 * @example
 * ```typescript
 * // For testing
 * await resetMigrationTracking()
 * ```
 */
export async function resetMigrationTracking(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([
      MIGRATION_STATUS_KEY,
      MIGRATION_COMPLETED_KEY,
      MIGRATION_POSTPONE_COUNT_KEY,
      MIGRATION_FIRST_PROMPTED_KEY,
    ])

    return true
  } catch (error) {
    console.error('Error resetting migration tracking:', error)
    return false
  }
}

/**
 * Check if migration deadline has passed
 * 
 * Returns true if user has been prompted for migration more than X days ago.
 * Used to enforce migration after grace period.
 * 
 * @param gracePeriodDays - Number of days before enforcing migration (default: 90)
 * @returns true if deadline passed, false otherwise
 * 
 * @example
 * ```typescript
 * const deadlinePassed = await isMigrationDeadlinePassed(90)
 * if (deadlinePassed) {
 *   // Force migration (no postpone option)
 * }
 * ```
 */
export async function isMigrationDeadlinePassed(gracePeriodDays: number = 90): Promise<boolean> {
  try {
    const firstPromptedStr = await AsyncStorage.getItem(MIGRATION_FIRST_PROMPTED_KEY)
    
    if (!firstPromptedStr) {
      return false
    }

    const firstPromptedAt = parseInt(firstPromptedStr, 10)
    const now = Date.now()
    const daysSinceFirstPrompt = (now - firstPromptedAt) / (1000 * 60 * 60 * 24)

    return daysSinceFirstPrompt >= gracePeriodDays
  } catch (error) {
    console.error('Error checking migration deadline:', error)
    return false
  }
}

/**
 * Get days remaining until migration deadline
 * 
 * @param gracePeriodDays - Number of days before enforcing migration (default: 90)
 * @returns Number of days remaining, or null if not yet prompted
 * 
 * @example
 * ```typescript
 * const daysRemaining = await getDaysUntilMigrationDeadline()
 * if (daysRemaining !== null && daysRemaining <= 7) {
 *   // Show urgent warning
 * }
 * ```
 */
export async function getDaysUntilMigrationDeadline(gracePeriodDays: number = 90): Promise<number | null> {
  try {
    const firstPromptedStr = await AsyncStorage.getItem(MIGRATION_FIRST_PROMPTED_KEY)
    
    if (!firstPromptedStr) {
      return null
    }

    const firstPromptedAt = parseInt(firstPromptedStr, 10)
    const now = Date.now()
    const daysSinceFirstPrompt = (now - firstPromptedAt) / (1000 * 60 * 60 * 24)
    const daysRemaining = Math.max(0, gracePeriodDays - daysSinceFirstPrompt)

    return Math.ceil(daysRemaining)
  } catch (error) {
    console.error('Error getting days until deadline:', error)
    return null
  }
}
