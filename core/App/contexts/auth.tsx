import React, { createContext, useContext, useState } from 'react'

import { generateKeyForPin, getStoredWalletId, getWalletKey, setGenericPassword } from '../services/keychain.service'
import { WalletSecret } from '../types/security'

export interface AuthContext {
  getWalletSecret: () => Promise<WalletSecret | undefined>
  getWalletID: () => Promise<string | undefined>
  getKeyForPIN: (pin: string, providedSalt?: string) => Promise<any>
  setAppPIN: (pin: string) => Promise<void>
  comparePIN: (newPin: string) => Promise<boolean>
}

export const AuthContext = createContext<AuthContext>(null as unknown as AuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()

  const getWalletSecret = async (): Promise<WalletSecret | undefined> => {
    try {
      if (!walletSecret) {
        const walletKey = await getWalletKey('Confirm your biometrics to open the wallet', '')
        if (!walletKey) {
          throw new Error(`[79]Cannot get wallet key`)
        }

        const walletID = await getStoredWalletId()
        if (!walletID) {
          throw new Error(`[119]:wallet id undefined`)
        }

        const secret: WalletSecret = {
          walletId: walletID,
          walletKey: walletKey,
        }

        setWalletSecret(secret)

        return secret
      } else {
        return walletSecret
      }
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  // Set PIN and create wallet secret from PIN
  const setAppPIN = async (pin: string): Promise<void> => {
    try {
      const walletSecretObject = await setGenericPassword(pin)
      setWalletSecret(walletSecretObject)
    } catch (e) {
      throw new Error(`${e}`)
    }
  }

  const getWalletID = async (): Promise<string | undefined> => {
    try {
      const walletID = await getStoredWalletId()
      if (!walletID) {
        return undefined
      }

      return walletID
    } catch (e) {
      throw new Error(`${e}`)
    }
  }

  const getKeyForPIN = (pin: string, providedSalt?: string): Promise<any> => {
    return generateKeyForPin(pin, providedSalt)
  }

  const comparePIN = async (newPin: string): Promise<boolean> => {
    const keyforPin = await getKeyForPIN(newPin)
    const walletSecret = await getWalletSecret()
    const walletKey = walletSecret?.walletKey

    if (keyforPin === walletKey) {
      return true
    } else {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        getWalletSecret,
        getWalletID: getWalletID,
        getKeyForPIN: getKeyForPIN,
        setAppPIN,
        comparePIN: comparePIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
