import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import React from 'react'
import { useTheme } from './theme'

export interface NavContainerProps extends React.PropsWithChildren {
  navigationRef: React.RefObject<NavigationContainerRef<any>> | null
}

const NavContainer = ({ navigationRef, children }: NavContainerProps) => {
  const { NavigationTheme } = useTheme()

  return (
    <NavigationContainer ref={navigationRef} theme={NavigationTheme}>
      {children}
    </NavigationContainer>
  )
}

export default NavContainer
