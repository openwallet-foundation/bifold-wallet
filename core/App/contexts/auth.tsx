import React, { createContext, useContext, useState } from 'react'

import { getWalletKey, setGenericPassword } from '../services/keychain.service'
import { WalletSecret } from '../types/security'

export interface AuthContext {
  getWalletSecret: () => Promise<WalletSecret | undefined>
  setAppPIN: (pin: string) => Promise<void>
}

export const AuthContext = createContext<AuthContext>(null as unknown as AuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()

  const getWalletSecret = async (): Promise<WalletSecret | undefined> => {
    try {
      if (!walletSecret) {
        const walletKey = await getWalletKey()
        if (!walletKey) {
          throw new Error(`[79]Cannot get wallet key`)
        }

        setWalletSecret(walletKey)

        return walletKey
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

  return (
    <AuthContext.Provider
      value={{
        getWalletSecret,
        setAppPIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
