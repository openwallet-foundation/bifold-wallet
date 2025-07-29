import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import { ThemedText } from '../texts/ThemedText'
import SafeAreaModal from './SafeAreaModal'

interface AppGuideModalProps {
  title: string
  description?: string
  onCallToActionPressed?: GenericFn
  onCallToActionLabel?: string
  onSecondCallToActionPressed?: GenericFn
  onSecondCallToActionLabel?: string
  onDismissPressed: GenericFn
}

const AppGuideModal: React.FC<AppGuideModalProps> = ({
  title,
  description,
  onCallToActionPressed,
  onCallToActionLabel,
  onSecondCallToActionPressed,
  onSecondCallToActionLabel,
  onDismissPressed,
}) => {
  const { height, width } = useWindowDimensions()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const iconSize = 30
  const dismissIconName = 'clear'
  const iconColor = ColorPalette.notification.infoIcon

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPalette.notification.popupOverlay,
      padding: 10,
      minHeight: height,
      minWidth: width,
    },
    container: {
      backgroundColor: ColorPalette.notification.info,
      borderColor: ColorPalette.notification.infoBorder,
      borderRadius: 5,
      borderWidth: 1,
      padding: 20,
      width: width - 50,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerTextContainer: {
      flex: 1,
      flexWrap: 'wrap',
    },
    headerText: {
      alignSelf: 'flex-start',
      flexWrap: 'wrap',
      color: ColorPalette.notification.infoText,
    },
    bodyText: {
      flexShrink: 1,
      marginVertical: 16,
      color: ColorPalette.notification.infoText,
    },
    dismissIcon: {
      alignSelf: 'center',
    },
  })

  return (
    <SafeAreaModal transparent accessibilityViewIsModal>
      <View style={styles.modalCenter}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <ThemedText
                maxFontSizeMultiplier={1.5}
                variant="headingThree"
                style={styles.headerText}
                testID={testIdWithKey('HeaderText')}
                accessibilityRole="header"
              >
                {title}
              </ThemedText>
            </View>
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
          </View>
          <View>
            <ThemedText maxFontSizeMultiplier={1.5} style={styles.bodyText} testID={testIdWithKey('BodyText')}>
              {description}
            </ThemedText>
            {onCallToActionPressed && (
              <View style={{ width: '100%', marginBottom: 10 }}>
                <Button
                  title={onCallToActionLabel || t('Global.Okay')}
                  accessibilityLabel={onCallToActionLabel || t('Global.Okay')}
                  testID={testIdWithKey('Primary')}
                  buttonType={ButtonType.Primary}
                  onPress={onCallToActionPressed}
                  maxfontSizeMultiplier={1.5}
                />
              </View>
            )}
            {onSecondCallToActionPressed && (
              <Button
                title={onSecondCallToActionLabel || t('Global.Dismiss')}
                accessibilityLabel={onSecondCallToActionLabel || t('Global.Dismiss')}
                testID={testIdWithKey('Secondary')}
                buttonType={ButtonType.Secondary}
                onPress={onSecondCallToActionPressed}
                maxfontSizeMultiplier={1.5}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaModal>
  )
}

export default AppGuideModal
