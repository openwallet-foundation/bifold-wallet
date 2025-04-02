import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import ImageModal from '../modals/ImageModal'
import { hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

interface RecordBinaryFieldProps {
  attributeValue: string
  shown?: boolean
  style?: Record<string, unknown>
}

const RecordBinaryField: React.FC<RecordBinaryFieldProps> = ({ attributeValue, shown, style }) => {
  const { ListItems } = useTheme()
  const { t } = useTranslation()
  const [showImageModal, setShowImageModal] = useState(false)

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
        <TouchableOpacity
          accessibilityLabel={t('Record.Zoom')}
          testID={testIdWithKey('zoom')}
          onPress={() => setShowImageModal(true)}
          accessibilityRole="imagebutton"
        >
          <Image style={styles.image} source={{ uri: attributeValue }} />
        </TouchableOpacity>
      ) : (
        <ThemedText style={style || styles.text} testID={testIdWithKey('AttributeValue')}>
          {hiddenFieldValue}
        </ThemedText>
      )}
      {showImageModal && <ImageModal uri={attributeValue} onDismissPressed={() => setShowImageModal(false)} />}
    </View>
  )
}

export default RecordBinaryField
