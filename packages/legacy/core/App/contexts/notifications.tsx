import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { createContext, useContext, useState, useRef } from 'react'

import { getConnectionRequestCount } from '../utils/connectionRequestHelpers'
import { getItem } from '../utils/storage'
import InviteInfoModal from '../components/modals/InviteInfoModal'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'

export interface NotificationContext {
  newNotificationsCheck: () => boolean
}

export const NotificationContext = createContext<NotificationContext>(null as unknown as NotificationContext)

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const netInfo = useNetInfo()
  const [isInviteInfoModalDisplayed, setIsInviteInfoModalDisplayed] = useState<boolean>(false)
  const [inviteCount, setInviteCount] = useState<number>(-1)
  const inviteCountRef = useRef(inviteCount);
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()


  const displayInviteInfoModal = () => {
    setIsInviteInfoModalDisplayed(true)
  }

  const hideInviteInfoModal = () => {
    setIsInviteInfoModalDisplayed(false)

    // Navigate to contact screen
    navigation.navigate(Stacks.ContactStack as any, {
      screen: Screens.Contacts,
      params: {
        showInviteModalOnStart: true
      }
    })
  }

  const newNotificationsCheck = () => {
    return true
  }

  React.useEffect(() => {
    inviteCountRef.current = inviteCount; // Update the ref whenever inviteCount changes
  }, [inviteCount]);

  React.useEffect(() => {
    console.log('Starting notification context provider')
    const interval = setInterval(() => {
      setTimeout(() => {
        getItem('proxyOwner').then((storedData) => {
          if (storedData?.id) {
            checkIfNewInvite(storedData?.id).then((newInvite) => {
              if (newInvite) {
                console.log('Displaying invite info modal')
              }
            })
          }
        })
      }, 10000)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkIfNewInvite = async (id: string) => {
    const newInviteCount = await getConnectionRequestCount(id)

    if (typeof newInviteCount === 'number' && newInviteCount !== inviteCountRef.current) {
      const prevCount = inviteCountRef.current
      console.log('New invite detected, setting new count to: ' + newInviteCount.toString())
      setInviteCount(newInviteCount)

      if (prevCount === -1) {
        return false
      } else {
        console.log('New invite detected')
        displayInviteInfoModal()
        return true
      }
    }
    else {
      return false
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        newNotificationsCheck,
      }}
    >
      {children}
      <InviteInfoModal visible={isInviteInfoModalDisplayed} onSubmit={() => hideInviteInfoModal()} />

    </NotificationContext.Provider>
  )
}

export const useInviteNotifications = () => useContext(NotificationContext)
