import React from 'react'
import { View, Text } from 'react-native'

import { useTheme } from '../contexts/theme'

const Developer: React.FC = () => {
  const { ColorPallet, TextTheme } = useTheme()
  return (
    <View
      style={{
        marginTop: 50,
        marginHorizontal: 20,
        borderColor: ColorPallet.brand.primary,
        borderWidth: 1,
        borderRadius: 3,
      }}
    >
      <Text style={[TextTheme.normal, { margin: 10 }]}>
        Place content here you would like to make available to developers when developer mode is enabled.
      </Text>
    </View>
  )
}

export default Developer
