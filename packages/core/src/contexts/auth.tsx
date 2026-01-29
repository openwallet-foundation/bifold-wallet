// Dont remove the following import line or the pin check will fail when opening askar waller
import '@hyperledger/aries-askar-react-native'

import 'reflect-metadata'
import { DeviceEventEmitter } from 'react-native'
import { AskarWallet } from '@credo-ts/askar'
import { Agent, ConsoleLogger, LogLevel, SigningProviderRegistry } from '@credo-ts/core'
import { agentDependencies } from '@credo-ts/react-native'
import React, { createContext, useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DispatchAction } from './reducers/store'
import { useStore } from './store'
import {
  isBiometricsActive,
  loadWalletSalt,
  loadWalletSecret,
  secretForPIN,
  storeWalletSecret,
  wipeWalletKey,
} from '../services/keychain'
import { WalletSecret } from '../types/security'
import { migrateToAskar } from '../utils/migration'
import { BifoldError } from '../types/error'
import { EventTypes } from '../constants'
import { useServices, TOKENS } from '../container-api'
import * as MnemonicStorage from '../services/MnemonicStorage'
import * as KeyDerivation from '../services/KeyDerivation'

export interface AuthContext {
  lockOutUser: (reason: LockoutReason) => void
  checkWalletPIN: (PIN: string) => Promise<boolean>
  getWalletSecret: () => Promise<WalletSecret | undefined>
  walletSecret?: WalletSecret
  removeSavedWalletSecret: () => void
  disableBiometrics: () => Promise<void>
  setPIN: (PIN: string) => Promise<void>
  commitWalletToKeychain: (useBiometry: boolean) => Promise<boolean>
  isBiometricsActive: () => Promise<boolean>
  verifyPIN: (PIN: string) => Promise<boolean>
  rekeyWallet: (agent: Agent, oldPin: string, newPin: string, useBiometry?: boolean) => Promise<boolean>
  pinAttempts: number
  resetPinAttempts: () => void
  maxPinAttempts: number
  shouldOfferMnemonicRecovery: boolean
  recoverWithMnemonic: (mnemonic: string, newPin: string) => Promise<boolean>
}

export const AuthContext = createContext<AuthContext>(null as unknown as AuthContext)
export enum LockoutReason {
  Timeout = 'Timeout',
  Logout = 'Logout',
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()
  const [pinAttempts, setPinAttempts] = useState<number>(0)
  const maxPinAttempts = 3
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const [
    hashPIN
  ] = useServices([
    TOKENS.FN_PIN_HASH_ALGORITHM,
  ])

  // Task 6.2.4: Track if user should be offered mnemonic recovery
  const shouldOfferMnemonicRecovery = pinAttempts >= maxPinAttempts

  const resetPinAttempts = useCallback(() => {
    setPinAttempts(0)
  }, [])

  const setPIN = useCallback(async (PIN: string): Promise<void> => {
    const secret = await secretForPIN(PIN, hashPIN)
    await storeWalletSecret(secret)
  }, [hashPIN])

  const getWalletSecret = useCallback(async (): Promise<WalletSecret | undefined> => {
    if (walletSecret) {
      return walletSecret
    }

    const secret = await loadWalletSecret(t('Biometry.UnlockPromptTitle'), t('Biometry.UnlockPromptDescription'))

    setWalletSecret(secret)

    return secret
  }, [t, walletSecret])

  const commitWalletToKeychain = useCallback(
    async (useBiometry: boolean): Promise<boolean> => {
      const secret = await getWalletSecret()
      if (!secret) {
        return false
      }

      // set did authenticate to true if we can get wallet credentials
      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
      })
      if (useBiometry) {
        await storeWalletSecret(secret, useBiometry)
      } else {
        // erase wallet key if biometrics is disabled
        await wipeWalletKey(useBiometry)
      }

      return true
    },
    [dispatch, getWalletSecret]
  )

  const checkWalletPIN = useCallback(
    async (PIN: string): Promise<boolean> => {
      try {
        // Task 6.2.2: Use new wallet open flow with mnemonic
        // Check if we have mnemonic-based wallet (new format)
        const hasMnemonic = await MnemonicStorage.hasMnemonicInKeychain()
        
        if (hasMnemonic) {
          // New format: Use mnemonic-based authentication
          try {
            const encryptedData = await MnemonicStorage.loadMnemonicFromKeychain()
            
            if (!encryptedData) {
              return false
            }
            
            // Try to decrypt mnemonic with PIN
            const mnemonic = await MnemonicStorage.decryptMnemonic(encryptedData, PIN)
            
            // Validate mnemonic
            if (!KeyDerivation.isValidMnemonic(mnemonic)) {
              return false
            }
            
            // Derive wallet key
            const walletKey = KeyDerivation.deriveWalletKeyFromMnemonic(mnemonic)
            
            // Verify wallet can be opened with derived key
            const askarWallet = new AskarWallet(
              new ConsoleLogger(LogLevel.off),
              new agentDependencies.FileSystem(),
              new SigningProviderRegistry([])
            )
            
            const secret = await loadWalletSalt()
            if (!secret) {
              return false
            }
            
            await askarWallet.open({
              id: secret.id,
              key: walletKey,
            })
            
            await askarWallet.close()
            
            setWalletSecret({ id: secret.id, key: walletKey, salt: secret.salt })
            
            // Task 6.2.3: Reset PIN attempts on successful authentication
            resetPinAttempts()
            
            // Store PIN in authenticated session for backup feature
            MnemonicStorage.storeAuthenticatedSessionPIN(PIN)
            
            return true
          } catch (error) {
            // Task 6.2.3: Increment PIN attempts on failure
            setPinAttempts(prev => prev + 1)
            return false
          }
        }
        
        // Old format: Use legacy PIN-based authentication
        const secret = await loadWalletSalt()

        if (!secret?.salt) {
          return false
        }

        const hash = await hashPIN(PIN, secret.salt)

        if (!store.migration.didMigrateToAskar) {
          await migrateToAskar(secret.id, hash)
          dispatch({
            type: DispatchAction.DID_MIGRATE_TO_ASKAR,
          })
        }

        // NOTE: We create an instance of AskarWallet, which is the underlying wallet that powers the app
        // we then open that instance with the provided id and key to verify their integrity
        const askarWallet = new AskarWallet(
          new ConsoleLogger(LogLevel.off),
          new agentDependencies.FileSystem(),
          new SigningProviderRegistry([])
        )
        await askarWallet.open({
          id: secret.id,
          key: hash,
        })

        await askarWallet.close()

        setWalletSecret({ id: secret.id, key: hash, salt: secret.salt })
        
        // Reset PIN attempts on successful authentication
        resetPinAttempts()
        
        // Store PIN in AsyncStorage for backup convenience
        AsyncStorage.setItem('@BifoldWallet:UserPIN', PIN).catch((error) => {
          console.warn('Failed to store PIN in AsyncStorage:', error)
        })
        
        return true
      } catch (e) {
        // Increment PIN attempts on failure
        setPinAttempts(prev => prev + 1)
        
        return false
      }
    },
    [dispatch, store.migration.didMigrateToAskar, hashPIN, resetPinAttempts]
  )

  const removeSavedWalletSecret = useCallback(() => {
    setWalletSecret(undefined)
  }, [])

  const lockOutUser = useCallback(
    (reason: LockoutReason) => {
      removeSavedWalletSecret()
      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
        payload: [false],
      })
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: reason === LockoutReason.Timeout }],
      })
    },
    [removeSavedWalletSecret, dispatch]
  )

  const disableBiometrics = useCallback(async () => {
    await wipeWalletKey(true)
  }, [])

  const rekeyWallet = useCallback(
    async (agent: Agent, oldPin: string, newPin: string, useBiometry?: boolean): Promise<boolean> => {
      try {
        if (!agent) {
          // no agent set, cannot rekey the wallet
          return false
        }
        // argon2.hash can sometimes generate an error
        const secret = await loadWalletSalt()
        if (!secret) {
          return false
        }

        const oldHash = await hashPIN(oldPin, secret.salt)
        const newSecret = await secretForPIN(newPin, hashPIN)
        const newHash = await hashPIN(newPin, newSecret.salt)
        if (!newSecret.key) {
          return false
        }

        await agent.wallet.close()
        // wallet.rotateKey calls open under the hood
        await agent.wallet.rotateKey({ id: secret.id, key: oldHash, rekey: newHash })

        await storeWalletSecret(newSecret, useBiometry)
        setWalletSecret(newSecret)
      } catch {
        return false
      }
      return true
    },
    [hashPIN]
  )

  const verifyPIN = useCallback(
    async (PIN: string) => {
      try {
        const credentials = await getWalletSecret()
        if (!credentials) {
          throw new Error('Get wallet credentials error')
        }
        const key = await hashPIN(PIN, credentials.salt)
        if (credentials.key !== key) {
          // Increment PIN attempts on failure
          setPinAttempts(prev => prev + 1)
          return false
        }

        // Reset PIN attempts on successful verification
        resetPinAttempts()
        
        // Store PIN in authenticated session for backup feature
        MnemonicStorage.storeAuthenticatedSessionPIN(PIN)
        
        return true
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1042'),
          t('Error.Message1042'),
          (err as Error)?.message ?? err,
          1042
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        
        // Increment PIN attempts on error
        setPinAttempts(prev => prev + 1)
        return false
      }
    },
    [getWalletSecret, t, hashPIN, resetPinAttempts]
  )

  // Task 6.2.4: Recover wallet with mnemonic after max PIN attempts
  const recoverWithMnemonic = useCallback(
    async (mnemonic: string, newPin: string): Promise<boolean> => {
      try {
        // Validate mnemonic
        if (!KeyDerivation.isValidMnemonic(mnemonic)) {
          throw new Error('Invalid mnemonic phrase')
        }
        
        // Derive wallet key from mnemonic
        const walletKey = KeyDerivation.deriveWalletKeyFromMnemonic(mnemonic)
        
        // Verify wallet can be opened with derived key
        const secret = await loadWalletSalt()
        if (!secret) {
          throw new Error('Wallet not found')
        }
        
        const askarWallet = new AskarWallet(
          new ConsoleLogger(LogLevel.off),
          new agentDependencies.FileSystem(),
          new SigningProviderRegistry([])
        )
        
        await askarWallet.open({
          id: secret.id,
          key: walletKey,
        })
        
        await askarWallet.close()
        
        // Encrypt mnemonic with new PIN and store in keychain
        await MnemonicStorage.encryptAndStoreMnemonic(mnemonic, newPin, false)
        
        // Update wallet secret
        setWalletSecret({ id: secret.id, key: walletKey, salt: secret.salt })
        
        // Reset PIN attempts
        resetPinAttempts()
        
        return true
      } catch (error) {
        return false
      }
    },
    [resetPinAttempts]
  )

  return (
    <AuthContext.Provider
      value={{
        lockOutUser,
        checkWalletPIN,
        getWalletSecret,
        removeSavedWalletSecret,
        disableBiometrics,
        commitWalletToKeychain,
        setPIN,
        isBiometricsActive,
        rekeyWallet,
        walletSecret,
        verifyPIN,
        pinAttempts,
        resetPinAttempts,
        maxPinAttempts,
        shouldOfferMnemonicRecovery,
        recoverWithMnemonic,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
