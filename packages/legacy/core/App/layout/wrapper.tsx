import React, { PropsWithChildren } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { Edge, SafeAreaView } from 'react-native-safe-area-context'

interface WrapperProps {
  safeArea?: boolean
  customEdges?: Edge[]
  style?: ViewStyle
  header?: () => React.ReactNode | undefined
}

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const ScreenLayout: React.FC<PropsWithChildren<WrapperProps>> = ({
  children,
  safeArea,
  customEdges,
  style,
  header,
}) => {
  const Container: React.FC<PropsWithChildren> = ({ children }) => {
    return safeArea || customEdges ? (
      <SafeAreaView style={[defaultStyles.container, style]} edges={customEdges || ['top', 'left', 'right', 'bottom']}>
        {children}
      </SafeAreaView>
    ) : (
      <View style={[defaultStyles.container, style]}>{children}</View>
    )
  }

  return (
    <Container>
      {header && header()}
      {children}
    </Container>
  )
}
export default ScreenLayout
