import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface RecordBinaryFieldProps {
  attributeValue: string
  shown?: boolean
}

const RecordBinaryField: React.FC<RecordBinaryFieldProps> = ({ attributeValue, shown }) => {
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
        <Text style={styles.text}>{Array(10).fill('\u2022').join('')}</Text>
      )}
    </View>
  )
}

export default RecordBinaryField
