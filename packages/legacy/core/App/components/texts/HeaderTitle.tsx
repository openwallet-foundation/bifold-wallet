import React, { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ImportantForAccessibility } from '../../types/accessibility'
import { useTour } from '../../contexts/tour/tour-context'

interface Props {
  children: React.ReactNode
}

// this component is used to create a custom header title that doesn't become oversized
// https://reactnavigation.org/docs/native-stack-navigator#headertitle
const HeaderTitle: React.FC<Props> = ({ children }) => {
  const { TextTheme } = useTheme()
  const { currentStep } = useTour()
  const [hideElements, setHideElements] = useState<ImportantForAccessibility>('auto')
  const styles = StyleSheet.create({
    title: {
      ...TextTheme.headerTitle,
      textAlign: 'center',
    },
  })
  useEffect(() => {
    setHideElements(currentStep === undefined ? 'auto' : 'no-hide-descendants')
  }, [currentStep])
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={1}
      ellipsizeMode="tail"
      style={styles.title}
      importantForAccessibility={hideElements}
    >
      {children}
    </Text>
  )
}

export default HeaderTitle
