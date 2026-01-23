import { NavigationContainer } from '@react-navigation/native'
import type { useNavigationContainerRef } from '@react-navigation/native'
import React from 'react'
import { useTheme } from './theme'

export interface NavContainerProps extends React.PropsWithChildren {
  navigationRef: ReturnType<typeof useNavigationContainerRef> | null
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
