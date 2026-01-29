/**
 * Unit tests for MigrationDetection service
 * 
 * Tests wallet format detection and migration status tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  WalletFormat,
  getWalletFormat,
  needsMigration,
  markMigrationComplete,
  getMigrationStatus,
  incrementPostponeCount,
  resetMigrationTracking,
  isMigrationDeadlinePassed,
  getDaysUntilMigrationDeadline,
} from '../MigrationDetection'
import { hasMnemonicInKeychain } from '../MnemonicStorage'
import { loadWalletSalt, WalletSalt } from '../keychain'

// Mock dependencies
jest.mock('../MnemonicStorage')
jest.mock('../keychain')
jest.mock('@react-native-async-storage/async-storage')

const mockedHasMnemonicInKeychain = hasMnemonicInKeychain as jest.MockedFunction<typeof hasMnemonicInKeychain>
const mockedLoadWalletSalt = loadWalletSalt as jest.MockedFunction<typeof loadWalletSalt>
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

// Helper function to create a properly typed WalletSalt for mocking
const createMockWalletSalt = (id = 'wallet-id', salt = 'some-salt-value'): WalletSalt => ({
  id,
  salt,
})

describe('MigrationDetection Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Reset AsyncStorage mock
    mockedAsyncStorage.getItem.mockResolvedValue(null)
    mockedAsyncStorage.setItem.mockResolvedValue(undefined)
    mockedAsyncStorage.multiSet.mockResolvedValue(undefined)
    mockedAsyncStorage.multiRemove.mockResolvedValue(undefined)
  })

  describe('getWalletFormat', () => {
    it('should detect NEW format when mnemonic exists in keychain', async () => {
      // Mock: mnemonic exists in keychain
      mockedHasMnemonicInKeychain.mockResolvedValue(true)
      mockedLoadWalletSalt.mockResolvedValue(undefined)

      const format = await getWalletFormat()

      expect(format).toBe(WalletFormat.NEW)
      expect(mockedHasMnemonicInKeychain).toHaveBeenCalledTimes(1)
    })

    it('should detect OLD format when wallet salt exists but no mnemonic', async () => {
      // Mock: no mnemonic, but wallet salt exists
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      const format = await getWalletFormat()

      expect(format).toBe(WalletFormat.OLD)
      expect(mockedHasMnemonicInKeychain).toHaveBeenCalledTimes(1)
      expect(mockedLoadWalletSalt).toHaveBeenCalledTimes(1)
    })

    it('should detect NONE format when neither mnemonic nor wallet salt exists', async () => {
      // Mock: no mnemonic, no wallet salt
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(undefined)

      const format = await getWalletFormat()

      expect(format).toBe(WalletFormat.NONE)
      expect(mockedHasMnemonicInKeychain).toHaveBeenCalledTimes(1)
      expect(mockedLoadWalletSalt).toHaveBeenCalledTimes(1)
    })

    it('should prioritize NEW format over OLD format', async () => {
      // Mock: both mnemonic and wallet salt exist (migration completed)
      mockedHasMnemonicInKeychain.mockResolvedValue(true)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      const format = await getWalletFormat()

      // Should return NEW because mnemonic check comes first
      expect(format).toBe(WalletFormat.NEW)
      expect(mockedHasMnemonicInKeychain).toHaveBeenCalledTimes(1)
      // Should not check wallet salt if mnemonic exists
      expect(mockedLoadWalletSalt).not.toHaveBeenCalled()
    })

    it('should return NONE on error', async () => {
      // Mock: error checking mnemonic
      mockedHasMnemonicInKeychain.mockRejectedValue(new Error('Keychain error'))

      const format = await getWalletFormat()

      expect(format).toBe(WalletFormat.NONE)
    })

    it('should handle wallet salt check error', async () => {
      // Mock: no mnemonic, error loading wallet salt
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockRejectedValue(new Error('Keychain error'))

      const format = await getWalletFormat()

      expect(format).toBe(WalletFormat.NONE)
    })
  })

  describe('needsMigration', () => {
    it('should return true for OLD format wallet without migration', async () => {
      // Mock: OLD format
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      // Mock: migration not completed
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const needs = await needsMigration()

      expect(needs).toBe(true)
    })

    it('should return false for NEW format wallet', async () => {
      // Mock: NEW format
      mockedHasMnemonicInKeychain.mockResolvedValue(true)

      const needs = await needsMigration()

      expect(needs).toBe(false)
    })

    it('should return false for NONE format (no wallet)', async () => {
      // Mock: NONE format
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(undefined)

      const needs = await needsMigration()

      expect(needs).toBe(false)
    })

    it('should return false if migration already completed', async () => {
      // Mock: OLD format
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())
      
      // Mock: migration completed
      mockedAsyncStorage.getItem.mockResolvedValue('true')

      const needs = await needsMigration()

      expect(needs).toBe(false)
    })

    it('should return false on error', async () => {
      // Mock: error
      mockedHasMnemonicInKeychain.mockRejectedValue(new Error('Error'))

      const needs = await needsMigration()

      expect(needs).toBe(false)
    })
  })

  describe('markMigrationComplete', () => {
    it('should mark migration as complete in AsyncStorage', async () => {
      const beforeTime = Date.now()
      
      const result = await markMigrationComplete()

      expect(result).toBe(true)
      expect(mockedAsyncStorage.multiSet).toHaveBeenCalledTimes(1)

      const call = mockedAsyncStorage.multiSet.mock.calls[0][0]
      expect(call).toHaveLength(2)
      
      // Check migration completed flag
      const completedEntry = call.find(([key]) => key === '@BifoldWallet:MigrationCompleted')
      expect(completedEntry).toBeDefined()
      expect(completedEntry![1]).toBe('true')
      
      // Check migration status with timestamp
      const statusEntry = call.find(([key]) => key === '@BifoldWallet:MigrationStatus')
      expect(statusEntry).toBeDefined()
      
      const statusData = JSON.parse(statusEntry![1])
      expect(statusData).toHaveProperty('completedAt')
      expect(statusData.completedAt).toBeGreaterThanOrEqual(beforeTime)
      expect(statusData.completedAt).toBeLessThanOrEqual(Date.now())
    })

    it('should return false on error', async () => {
      // Mock: storage error
      mockedAsyncStorage.multiSet.mockRejectedValue(new Error('Storage error'))

      const result = await markMigrationComplete()

      expect(result).toBe(false)
    })
  })

  describe('getMigrationStatus', () => {
    it('should return complete status for OLD format needing migration', async () => {
      // Mock: OLD format
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      // Mock: not completed, postponed 2 times
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationCompleted') return null
        if (key === '@BifoldWallet:MigrationPostponeCount') return '2'
        if (key === '@BifoldWallet:MigrationFirstPrompted') return '1704067200000' // 2024-01-01
        return null
      })

      const status = await getMigrationStatus()

      expect(status.needsMigration).toBe(true)
      expect(status.walletFormat).toBe(WalletFormat.OLD)
      expect(status.migrationCompleted).toBe(false)
      expect(status.postponeCount).toBe(2)
      expect(status.firstPromptedAt).toBe(1704067200000)
      expect(status.completedAt).toBeUndefined()
    })

    it('should return complete status for NEW format', async () => {
      // Mock: NEW format
      mockedHasMnemonicInKeychain.mockResolvedValue(true)

      const status = await getMigrationStatus()

      expect(status.needsMigration).toBe(false)
      expect(status.walletFormat).toBe(WalletFormat.NEW)
      expect(status.migrationCompleted).toBe(false)
      expect(status.postponeCount).toBe(0)
    })

    it('should return status with completion timestamp', async () => {
      // Mock: OLD format but migration completed
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      const completedAt = 1704153600000 // 2024-01-02

      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationCompleted') return 'true'
        if (key === '@BifoldWallet:MigrationStatus') {
          return JSON.stringify({ completedAt })
        }
        return null
      })

      const status = await getMigrationStatus()

      expect(status.needsMigration).toBe(false)
      expect(status.migrationCompleted).toBe(true)
      expect(status.completedAt).toBe(completedAt)
    })

    it('should return safe default on error', async () => {
      // Mock: error
      mockedHasMnemonicInKeychain.mockRejectedValue(new Error('Error'))

      const status = await getMigrationStatus()

      expect(status.needsMigration).toBe(false)
      expect(status.walletFormat).toBe(WalletFormat.NONE)
      expect(status.migrationCompleted).toBe(false)
      expect(status.postponeCount).toBe(0)
    })

    it('should handle missing postpone count', async () => {
      // Mock: OLD format, no postpone count
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const status = await getMigrationStatus()

      expect(status.postponeCount).toBe(0)
    })

    it('should handle invalid postpone count', async () => {
      // Mock: OLD format, invalid postpone count
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())
      
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return 'invalid'
        return null
      })

      const status = await getMigrationStatus()

      // Should default to 0 for invalid number
      expect(status.postponeCount).toBe(0)
    })
  })

  describe('incrementPostponeCount', () => {
    it('should increment postpone count from 0 to 1', async () => {
      // Mock: no existing count
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const count = await incrementPostponeCount()

      expect(count).toBe(1)
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@BifoldWallet:MigrationPostponeCount',
        '1'
      )
    })

    it('should increment existing postpone count', async () => {
      // Mock: existing count = 2
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '2'
        return null
      })

      const count = await incrementPostponeCount()

      expect(count).toBe(3)
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@BifoldWallet:MigrationPostponeCount',
        '3'
      )
    })

    it('should set first prompted timestamp on first postpone', async () => {
      // Mock: no existing data
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const beforeTime = Date.now()
      await incrementPostponeCount()
      const afterTime = Date.now()

      // Should set first prompted timestamp
      const setItemCalls = mockedAsyncStorage.setItem.mock.calls
      const firstPromptedCall = setItemCalls.find(
        ([key]) => key === '@BifoldWallet:MigrationFirstPrompted'
      )

      expect(firstPromptedCall).toBeDefined()
      
      const timestamp = parseInt(firstPromptedCall![1], 10)
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should not overwrite existing first prompted timestamp', async () => {
      const existingTimestamp = '1704067200000' // 2024-01-01
      
      // Mock: existing count and timestamp
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '1'
        if (key === '@BifoldWallet:MigrationFirstPrompted') return existingTimestamp
        return null
      })

      await incrementPostponeCount()

      // Should not set first prompted timestamp again
      const setItemCalls = mockedAsyncStorage.setItem.mock.calls
      const firstPromptedCall = setItemCalls.find(
        ([key]) => key === '@BifoldWallet:MigrationFirstPrompted'
      )

      expect(firstPromptedCall).toBeUndefined()
    })

    it('should return 0 on error', async () => {
      // Mock: storage error
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const count = await incrementPostponeCount()

      expect(count).toBe(0)
    })

    it('should handle invalid existing count', async () => {
      // Mock: invalid count
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return 'invalid'
        return null
      })

      const count = await incrementPostponeCount()

      // Should treat invalid as 0 and increment to 1
      expect(count).toBe(1)
    })
  })

  describe('resetMigrationTracking', () => {
    it('should remove all migration data from AsyncStorage', async () => {
      const result = await resetMigrationTracking()

      expect(result).toBe(true)
      expect(mockedAsyncStorage.multiRemove).toHaveBeenCalledTimes(1)

      const keys = mockedAsyncStorage.multiRemove.mock.calls[0][0]
      expect(keys).toContain('@BifoldWallet:MigrationStatus')
      expect(keys).toContain('@BifoldWallet:MigrationCompleted')
      expect(keys).toContain('@BifoldWallet:MigrationPostponeCount')
      expect(keys).toContain('@BifoldWallet:MigrationFirstPrompted')
      expect(keys).toHaveLength(4)
    })

    it('should return false on error', async () => {
      // Mock: storage error
      mockedAsyncStorage.multiRemove.mockRejectedValue(new Error('Storage error'))

      const result = await resetMigrationTracking()

      expect(result).toBe(false)
    })
  })

  describe('isMigrationDeadlinePassed', () => {
    it('should return false if never prompted', async () => {
      // Mock: no first prompted timestamp
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const passed = await isMigrationDeadlinePassed(90)

      expect(passed).toBe(false)
    })

    it('should return false if within grace period', async () => {
      // Mock: prompted 30 days ago
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(thirtyDaysAgo.toString())

      const passed = await isMigrationDeadlinePassed(90)

      expect(passed).toBe(false)
    })

    it('should return true if grace period passed', async () => {
      // Mock: prompted 100 days ago
      const hundredDaysAgo = Date.now() - (100 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(hundredDaysAgo.toString())

      const passed = await isMigrationDeadlinePassed(90)

      expect(passed).toBe(true)
    })

    it('should return true if exactly at deadline', async () => {
      // Mock: prompted exactly 90 days ago
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(ninetyDaysAgo.toString())

      const passed = await isMigrationDeadlinePassed(90)

      expect(passed).toBe(true)
    })

    it('should support custom grace period', async () => {
      // Mock: prompted 40 days ago
      const fortyDaysAgo = Date.now() - (40 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(fortyDaysAgo.toString())

      // 30 day grace period - should be passed
      const passed30 = await isMigrationDeadlinePassed(30)
      expect(passed30).toBe(true)

      // 60 day grace period - should not be passed
      const passed60 = await isMigrationDeadlinePassed(60)
      expect(passed60).toBe(false)
    })

    it('should return false on error', async () => {
      // Mock: storage error
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const passed = await isMigrationDeadlinePassed(90)

      expect(passed).toBe(false)
    })
  })

  describe('getDaysUntilMigrationDeadline', () => {
    it('should return null if never prompted', async () => {
      // Mock: no first prompted timestamp
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const days = await getDaysUntilMigrationDeadline(90)

      expect(days).toBeNull()
    })

    it('should return days remaining within grace period', async () => {
      // Mock: prompted 30 days ago
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(thirtyDaysAgo.toString())

      const days = await getDaysUntilMigrationDeadline(90)

      // Should have ~60 days remaining
      expect(days).toBeGreaterThanOrEqual(59)
      expect(days).toBeLessThanOrEqual(61)
    })

    it('should return 0 if grace period passed', async () => {
      // Mock: prompted 100 days ago
      const hundredDaysAgo = Date.now() - (100 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(hundredDaysAgo.toString())

      const days = await getDaysUntilMigrationDeadline(90)

      expect(days).toBe(0)
    })

    it('should return 0 if exactly at deadline', async () => {
      // Mock: prompted exactly 90 days ago
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(ninetyDaysAgo.toString())

      const days = await getDaysUntilMigrationDeadline(90)

      expect(days).toBe(0)
    })

    it('should ceil fractional days', async () => {
      // Mock: prompted 89.5 days ago
      const almostNinetyDaysAgo = Date.now() - (89.5 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(almostNinetyDaysAgo.toString())

      const days = await getDaysUntilMigrationDeadline(90)

      // Should ceil to 1 day remaining
      expect(days).toBe(1)
    })

    it('should support custom grace period', async () => {
      // Mock: prompted 20 days ago
      const twentyDaysAgo = Date.now() - (20 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(twentyDaysAgo.toString())

      // 30 day grace period - should have ~10 days
      const days30 = await getDaysUntilMigrationDeadline(30)
      expect(days30).toBeGreaterThanOrEqual(9)
      expect(days30).toBeLessThanOrEqual(11)

      // 60 day grace period - should have ~40 days
      const days60 = await getDaysUntilMigrationDeadline(60)
      expect(days60).toBeGreaterThanOrEqual(39)
      expect(days60).toBeLessThanOrEqual(41)
    })

    it('should return null on error', async () => {
      // Mock: storage error
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const days = await getDaysUntilMigrationDeadline(90)

      expect(days).toBeNull()
    })
  })

  describe('Integration tests', () => {
    it('should track complete migration workflow', async () => {
      // Step 1: Check initial status (OLD format, needs migration)
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      let status = await getMigrationStatus()
      expect(status.needsMigration).toBe(true)
      expect(status.walletFormat).toBe(WalletFormat.OLD)
      expect(status.postponeCount).toBe(0)

      // Step 2: User postpones migration
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '0'
        return null
      })

      let count = await incrementPostponeCount()
      expect(count).toBe(1)

      // Step 3: Check status after postpone
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '1'
        if (key === '@BifoldWallet:MigrationFirstPrompted') return Date.now().toString()
        return null
      })

      status = await getMigrationStatus()
      expect(status.postponeCount).toBe(1)
      expect(status.firstPromptedAt).toBeDefined()

      // Step 4: User postpones again
      count = await incrementPostponeCount()
      expect(count).toBe(2)

      // Step 5: User completes migration
      await markMigrationComplete()

      // Step 6: Check final status
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationCompleted') return 'true'
        if (key === '@BifoldWallet:MigrationStatus') {
          return JSON.stringify({ completedAt: Date.now() })
        }
        if (key === '@BifoldWallet:MigrationPostponeCount') return '2'
        return null
      })

      status = await getMigrationStatus()
      expect(status.needsMigration).toBe(false)
      expect(status.migrationCompleted).toBe(true)
      expect(status.completedAt).toBeDefined()
    })

    it('should handle deadline enforcement workflow', async () => {
      // Mock: OLD format, prompted 100 days ago
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      const hundredDaysAgo = Date.now() - (100 * 24 * 60 * 60 * 1000)

      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationFirstPrompted') return hundredDaysAgo.toString()
        if (key === '@BifoldWallet:MigrationPostponeCount') return '5'
        return null
      })

      // Check if deadline passed
      const deadlinePassed = await isMigrationDeadlinePassed(90)
      expect(deadlinePassed).toBe(true)

      // Check days remaining
      const daysRemaining = await getDaysUntilMigrationDeadline(90)
      expect(daysRemaining).toBe(0)

      // Check migration status
      const status = await getMigrationStatus()
      expect(status.needsMigration).toBe(true)
      expect(status.postponeCount).toBe(5)
    })

    it('should handle reset and restart workflow', async () => {
      // Step 1: Set up migration tracking
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())

      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '3'
        if (key === '@BifoldWallet:MigrationFirstPrompted') return Date.now().toString()
        return null
      })

      let status = await getMigrationStatus()
      expect(status.postponeCount).toBe(3)

      // Step 2: Reset tracking
      await resetMigrationTracking()

      // Step 3: Check status after reset
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      status = await getMigrationStatus()
      expect(status.postponeCount).toBe(0)
      expect(status.firstPromptedAt).toBeUndefined()
      expect(status.migrationCompleted).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle corrupted AsyncStorage data', async () => {
      // Mock: corrupted JSON in status
      mockedHasMnemonicInKeychain.mockResolvedValue(false)
      mockedLoadWalletSalt.mockResolvedValue(createMockWalletSalt())
      
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationStatus') return 'invalid-json{'
        return null
      })

      // Should not throw, return safe default
      const status = await getMigrationStatus()
      expect(status.completedAt).toBeUndefined()
    })

    it('should handle very large postpone count', async () => {
      // Mock: postponed 999 times
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '999'
        return null
      })

      const count = await incrementPostponeCount()
      expect(count).toBe(1000)
    })

    it('should handle negative postpone count', async () => {
      // Mock: negative count (corrupted data)
      mockedAsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === '@BifoldWallet:MigrationPostponeCount') return '-5'
        return null
      })

      const count = await incrementPostponeCount()
      // Should increment from -5 to -4 (parseInt handles negative)
      expect(count).toBe(-4)
    })

    it('should handle future timestamp', async () => {
      // Mock: timestamp in the future (clock skew)
      const futureTimestamp = Date.now() + (10 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(futureTimestamp.toString())

      const passed = await isMigrationDeadlinePassed(90)
      // Should return false (negative days since prompt)
      expect(passed).toBe(false)

      const days = await getDaysUntilMigrationDeadline(90)
      // Should return large positive number
      expect(days).toBeGreaterThan(90)
    })

    it('should handle zero grace period', async () => {
      // Mock: prompted 1 day ago
      const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000)
      mockedAsyncStorage.getItem.mockResolvedValue(oneDayAgo.toString())

      const passed = await isMigrationDeadlinePassed(0)
      expect(passed).toBe(true)

      const days = await getDaysUntilMigrationDeadline(0)
      expect(days).toBe(0)
    })
  })
})
