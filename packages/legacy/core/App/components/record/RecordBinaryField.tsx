import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface RecordBinaryFieldProps {
  attributeValue: string
  shown?: boolean
  style?: Record<string, unknown>
}

const RecordBinaryField: React.FC<RecordBinaryFieldProps> = ({ attributeValue, shown, style }) => {
  const { ListItems } = useTheme()

  const styles = StyleSheet.create({
    text: {
      ...ListItems.recordAttributeText,
    },
    image: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
    },
  })

  return (
    <View>
      {shown ? (
        <Image style={styles.image} source={{ uri: attributeValue }} />
      ) : (
        <Text style={style || styles.text} testID={testIdWithKey('AttributeValue')}>
          {hiddenFieldValue}
        </Text>
      )}
    </View>
  )
}

export default RecordBinaryField
