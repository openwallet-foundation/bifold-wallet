import React, { createContext, useContext, useState } from 'react'

import { secretForPIN, storeWalletSecret, loadWalletSecret, convertToUseBiometrics } from '../services/keychain'
import { WalletSecret } from '../types/security'
import { hashPIN } from '../utils/crypto'

export interface AuthContext {
  checkPIN: (pin: string) => Promise<boolean>
  convertToUseBiometrics: () => Promise<boolean>
  getWalletCredentials: () => Promise<WalletSecret | undefined>
  setPIN: (pin: string) => Promise<void>
}

export const AuthContext = createContext<AuthContext>(null as unknown as AuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()

  const setPIN = async (pin: string): Promise<void> => {
    const secret = await secretForPIN(pin)
    await storeWalletSecret(secret)
  }

  const checkPIN = async (pin: string): Promise<boolean> => {
    const secret = await loadWalletSecret()

    if (!secret || !secret.salt) {
      return false
    }

    const hash = await hashPIN(pin, secret?.salt)

    return hash === secret.walletKey
  }

  const getWalletCredentials = async (): Promise<WalletSecret | undefined> => {
    if (walletSecret) {
      return walletSecret
    }

    const secret = await loadWalletSecret()
    if (!secret || !secret.walletKey) {
      return
    }

    delete secret.salt
    setWalletSecret(secret)

    return secret
  }

  return (
    <AuthContext.Provider
      value={{
        checkPIN,
        convertToUseBiometrics,
        getWalletCredentials,
        setPIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
