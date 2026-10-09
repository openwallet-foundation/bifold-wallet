import React, { useContext } from 'react'
import { View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ButtonLabelColorContext } from '../buttons/ButtonLabelColorContext'
import LoadingSpinner from './LoadingSpinner'

const ButtonLoading: React.FC = () => {
  const { ColorPalette, Spacing } = useTheme()
  const labelColor = useContext(ButtonLabelColorContext)

  return (
    <View style={{ marginRight: Spacing.sm }} testID={testIdWithKey('ButtonLoading')}>
      <LoadingSpinner size={24} color={labelColor ?? ColorPalette.brand.icon} />
    </View>
  )
}

export default ButtonLoading
