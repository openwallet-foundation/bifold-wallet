import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ScrollView,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import SafeAreaModal from './SafeAreaModal'

interface DismissiblePopupModalProps {
  title: string
  description?: string
  onCallToActionPressed?: GenericFn
  onCallToActionLabel?: string
  onDismissPressed: GenericFn
}

const DismissiblePopupModal: React.FC<DismissiblePopupModalProps> = ({
  title,
  description,
  onCallToActionPressed,
  onCallToActionLabel,
  onDismissPressed,
}) => {
  const { height, width } = useWindowDimensions()
  const { t } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const iconSize = 30

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.notification.popupOverlay,
      padding: 20,
      minHeight: height,
      minWidth: width,
    },
    container: {
      backgroundColor: ColorPallet.notification.info,
      borderColor: ColorPallet.notification.infoBorder,
      borderRadius: 5,
      borderWidth: 1,
      padding: 10,
      minWidth: width - 2 * 25,
      flex: 1,
      maxHeight: '50%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    bodyContainer: {
      marginLeft: 10 + iconSize,
      paddingHorizontal: 5,
      paddingBottom: 5,
      flexShrink: 1,
      justifyContent: 'space-between',
    },
    headerTextContainer: {
      flexGrow: 1,
    },
    headerText: {
      ...TextTheme.bold,
      alignSelf: 'flex-start',
      color: ColorPallet.notification.infoText,
    },
    scrollViewContentContainer: {
      flexGrow: 1,
    },
    scrollViewStyle: {
      flex: 1,
    },
    bodyText: {
      ...TextTheme.normal,
      paddingVertical: 16,
      color: ColorPallet.notification.infoText,
    },
    footer: {
      paddingTop: 10,
    },
    infoIcon: {
      marginRight: 10,
      alignSelf: 'center',
    },
    dismissIcon: {
      alignSelf: 'flex-end',
    },
  })

  const infoIconName = 'info'
  const dismissIconName = 'clear'
  const iconColor = ColorPallet.notification.infoIcon

  return (
    <SafeAreaModal transparent>
      <TouchableOpacity onPress={onDismissPressed} accessible={false}>
        <View style={styles.modalCenter}>
          <TouchableWithoutFeedback accessible={false}>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <View style={styles.infoIcon}>
                  <Icon name={infoIconName} size={iconSize} color={iconColor} />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                    {title}
                  </Text>
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
              <View style={styles.bodyContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollViewContentContainer}
                  style={styles.scrollViewStyle}
                >
                  <View onStartShouldSetResponder={() => true}>
                    <Text selectable={true} style={styles.bodyText} testID={testIdWithKey('BodyText')}>
                      {description}
                    </Text>
                  </View>
                </ScrollView>
                {onCallToActionPressed && (
                  <View style={styles.footer}>
                    <Button
                      title={onCallToActionLabel || t('Global.Okay')}
                      accessibilityLabel={onCallToActionLabel || t('Global.Okay')}
                      testID={testIdWithKey('Okay')}
                      buttonType={ButtonType.ModalPrimary}
                      onPress={onCallToActionPressed}
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </SafeAreaModal>
  )
}

export default DismissiblePopupModal
