import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, useWindowDimensions, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import SafeAreaModal from './SafeAreaModal'

interface ImageModalProps {
  uri: string
  onDismissPressed: GenericFn
}

const ImageModal: React.FC<ImageModalProps> = ({ uri, onDismissPressed }) => {
  const { height, width } = useWindowDimensions()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPalette.notification.popupOverlay,
      minHeight: height,
      minWidth: width,
      paddingHorizontal: 20,
      paddingVertical: 50,
    },
    container: {
      flexShrink: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    image: {
      width: width - 40,
      aspectRatio: 1,
      resizeMode: 'contain',
    },
    dismissIcon: {
      zIndex: 10,
      position: 'absolute',
      right: 20,
      top: 20,
    },
  })

  const iconSize = 30
  const dismissIconName = 'clear'
  const iconColor = ColorPalette.brand.primary

  return (
    <SafeAreaModal transparent>
      <TouchableOpacity onPress={onDismissPressed} accessible={false}>
        <View style={styles.modalCenter}>
          <TouchableWithoutFeedback accessible={false}>
            <View style={styles.container}>
              <View style={styles.dismissIcon}>
                <TouchableOpacity
                  onPress={onDismissPressed}
                  testID={testIdWithKey('Dismiss')}
                  accessibilityLabel={t('Global.Dismiss')}
                  accessibilityRole={'button'}
                  hitSlop={hitSlop}
                >
                  <Icon name={dismissIconName} size={iconSize} color={iconColor} />
                </TouchableOpacity>
              </View>
              <Image style={styles.image} source={{ uri }} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </SafeAreaModal>
  )
}

export default ImageModal
