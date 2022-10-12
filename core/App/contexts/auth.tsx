import React, { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  secretForPIN,
  storeWalletSecret,
  loadWalletSecret,
  convertToUseBiometrics,
  convertToDisableBiometrics,
  isBiometricsActive,
} from '../services/keychain'
import { PinChangeReturns, WalletSecret } from '../types/security'
import { hashPIN } from '../utils/crypto'

export interface AuthContext {
  checkPIN: (pin: string) => Promise<PinChangeReturns>
  convertToUseBiometrics: () => Promise<boolean>
  convertToDisableBiometrics: (walletSecret: WalletSecret) => Promise<boolean>
  getWalletCredentials: () => Promise<WalletSecret | undefined>
  setPIN: (pin: string) => Promise<void>
  isBiometricsActive: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContext>(null as unknown as AuthContext)

export const AuthProvider: React.FC = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()
  const { t } = useTranslation()

  const setPIN = async (pin: string): Promise<void> => {
    const secret = await secretForPIN(pin)
    await storeWalletSecret(secret)
  }

  const checkPIN = async (pin: string): Promise<PinChangeReturns> => {
    const secret = await loadWalletSecret()

    if (!secret || !secret.salt || !secret.key) {
      return {
        walletSecret: secret,
        pinCorrect: false,
      }
    }

    const hash = await hashPIN(pin, secret.salt)

    return {
      walletSecret: secret,
      pinCorrect: hash === secret.key,
    }
  }

  const getWalletCredentials = async (): Promise<WalletSecret | undefined> => {
    if (walletSecret) {
      return walletSecret
    }

    const secret = await loadWalletSecret(t('Biometry.UnlockPromptTitle'), t('Biometry.UnlockPromptDescription'))
    if (!secret || !secret.key) {
      return
    }

    setWalletSecret(secret)

    return secret
  }

  return (
    <AuthContext.Provider
      value={{
        checkPIN,
        convertToUseBiometrics,
        convertToDisableBiometrics,
        getWalletCredentials,
        setPIN,
        isBiometricsActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
