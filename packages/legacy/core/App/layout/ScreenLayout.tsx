import React, { PropsWithChildren } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import { TOKENS, useServices } from '../container-api'
import { Screens } from 'types/navigators'

export interface LayoutProps {
  safeArea?: boolean
  customEdges?: Edge[]
  style?: ViewStyle
  Header?: React.FC | undefined
}

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

type Props = {
  screen: Screens
}

const ScreenLayout: React.FC<PropsWithChildren<Props>> = ({ children, screen }) => {
  //safeArea, customEdges, style, header
  const [screenLayoutOptions] = useServices([TOKENS.OBJECT_LAYOUT_CONFIG])
  const screenProps = screenLayoutOptions[screen]
  const { safeArea, customEdges, style, Header } = screenProps || {
    safeArea: false,
    customEdges: ['top', 'left', 'right', 'bottom'],
    style: {},
    Header: undefined,
  }

  const Container: React.FC<PropsWithChildren> = ({ children }) => {
    return safeArea ? (
      <SafeAreaView style={[defaultStyles.container, style]} edges={customEdges || ['top', 'left', 'right', 'bottom']}>
        {children}
      </SafeAreaView>
    ) : (
      <View style={[defaultStyles.container, style]}>{children}</View>
    )
  }

  return (
    <Container>
      {Header && <Header />}
      {children}
    </Container>
  )
}
export default ScreenLayout
