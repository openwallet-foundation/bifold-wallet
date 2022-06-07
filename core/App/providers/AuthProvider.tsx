import React, { useContext, useEffect, useState } from 'react'

import { getWalletKey, setGenericPassword } from '../services/keychain.service'
import { WalletSecret } from '../types/security'

interface AuthContextType {
  setAppPin: (pin: string) => Promise<void>
  getWalletIdSecret: () => Promise<WalletSecret | undefined>
}

const AuthContext = React.createContext<any>({})

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext)
}

const AuthProvider: React.FC = ({ children }) => {
  const [walletSecret, setWalletSecret] = useState<WalletSecret>()

  //Set pin and create wallet secret from Pin
  const setAppPin = async (pin: string): Promise<void> => {
    // console.log('AuthProvider: setting pin:', pin)
    try {
      const _walletSecretObject = await setGenericPassword(pin)
      // console.log('AuthProvider: Wallet secret created:', _walletSecretObject)
      setWalletSecret(_walletSecretObject)
    } catch (e) {
      throw new Error(`${e}`)
    }
  }

  //Get wallet secret that includes wallet key
  const getWalletIdSecret = async (): Promise<WalletSecret | undefined> => {
    // console.log('AuthProvider: getWalletIdSecret ..')
    try {
      if (!walletSecret) {
        const walletKey = await getWalletKey()
        if (!walletKey) {
          // console.log(`[79]Cannot get wallet key`)
          throw new Error(`[79]Cannot get wallet key`)
        }

        // console.log(`[79]Wallet secret fetched:${walletKey}`)
        setWalletSecret(walletKey)

        return walletKey
      } else {
        // console.log(`[48]Wallet secret already found:${JSON.stringify(walletSecret)}`)
        return walletSecret
      }
    } catch (error) {
      // console.log('Error[69] fetching wallet secret!', error)
      throw new Error(`${error}`)
    }
  }

  useEffect(() => {
    // console.log('Auth provider initilized ..')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        setAppPin: setAppPin,
        getWalletIdSecret: getWalletIdSecret,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
