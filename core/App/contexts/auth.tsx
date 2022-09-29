import { Agent, AgentConfig } from '@aries-framework/core'
import { IndyWallet } from '@aries-framework/core/build/wallet/IndyWallet'
import { agentDependencies } from '@aries-framework/react-native'
import React, { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  secretForPIN,
  storeWalletSecret,
  loadWalletSecret,
  isBiometricsActive,
  wipeWalletKey,
} from '../services/keychain'
import { WalletSecret } from '../types/security'
import { hashPIN } from '../utils/crypto'

export interface AuthContext {
  checkPIN: (pin: string) => Promise<boolean>
  getWalletCredentials: () => Promise<WalletSecret | undefined>
  setPIN: (pin: string) => Promise<void>
  commitPIN: (useBiometry: boolean) => Promise<boolean>
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

  const commitPIN = async (useBiometry: boolean): Promise<boolean> => {
    const secret = walletSecret
    if (!secret) {
      return false
    }
    if (useBiometry) {
      await storeWalletSecret(secret, useBiometry)
    } else {
      // erase wallet key if biometrics is disabled
      await wipeWalletKey(useBiometry)
    }
    return true
  }

  const checkPIN = async (pin: string): Promise<boolean> => {
    const secret = await loadWalletSecret('', '', false)

    if (!secret || !secret.salt) {
      return false
    }

    const hash = await hashPIN(pin, secret.salt)

    try {
      await agentDependencies.indy.openWallet({ id: secret.id }, { key: hash })
      // need full secret in volatile memory in case user wants to fall back to using PIN
      const fullSecret = await secretForPIN(pin, secret.salt)
      setWalletSecret(fullSecret)
      return true
    } catch (e) {
      return false
    }
  }

  const getWalletCredentials = async (): Promise<WalletSecret | undefined> => {
    if (walletSecret) {
      return walletSecret
    }

    const secret = await loadWalletSecret(t('Biometry.UnlockPromptTitle'), t('Biometry.UnlockPromptDescription'))
    if (!secret) {
      return
    }

    setWalletSecret(secret)

    return secret
  }

  return (
    <AuthContext.Provider
      value={{
        checkPIN,
        getWalletCredentials,
        commitPIN,
        setPIN,
        isBiometricsActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
