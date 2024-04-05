import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { createContext, useContext, useState, useRef } from 'react'

import { getConnectionRequestCount } from '../utils/connectionRequestHelpers'
import { getItem } from '../utils/storage'
import InviteInfoModal from '../components/modals/InviteInfoModal'

export interface NotificationContext {
  newNotificationsCheck: () => boolean
}

export const NotificationContext = createContext<NotificationContext>(null as unknown as NotificationContext)

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const netInfo = useNetInfo()
  const [isInviteInfoModalDisplayed, setIsInviteInfoModalDisplayed] = useState<boolean>(false)
  const [inviteCount, setInviteCount] = useState<number>(-1)
  const inviteCountRef = useRef(inviteCount);


  const displayInviteInfoModal = () => {
    setIsInviteInfoModalDisplayed(true)
  }

  const hideInviteInfoModal = () => {
    setIsInviteInfoModalDisplayed(false)
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
      }, 5000)
    }, 5000)
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
