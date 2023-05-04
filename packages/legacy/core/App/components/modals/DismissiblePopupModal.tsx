import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, View, Text, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

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
  const { height, width } = Dimensions.get('window')
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
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    bodyContainer: {
      flexDirection: 'column',
      marginLeft: 10 + iconSize,
      paddingHorizontal: 5,
      paddingBottom: 5,
    },
    headerTextContainer: {
      flexDirection: 'column',
      flexGrow: 1,
    },
    headerText: {
      ...TextTheme.normal,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      color: ColorPallet.notification.infoText,
    },
    bodyText: {
      ...TextTheme.normal,
      flexShrink: 1,
      marginVertical: 16,
      color: ColorPallet.notification.infoText,
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
    <Modal transparent>
      <TouchableOpacity onPress={onDismissPressed} accessible={false}>
        <View style={styles.modalCenter}>
          <TouchableWithoutFeedback accessible={false}>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <View style={[styles.infoIcon]}>
                  <Icon name={infoIconName} size={iconSize} color={iconColor} />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                    {title}
                  </Text>
                </View>
                <View style={[styles.dismissIcon]} testID={testIdWithKey('Dismiss')}>
                  <TouchableOpacity onPress={onDismissPressed}>
                    <Icon name={dismissIconName} size={iconSize} color={iconColor} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.bodyContainer}>
                <Text style={styles.bodyText} testID={testIdWithKey('BodyText')}>
                  {description}
                </Text>
                {onCallToActionPressed && (
                  <Button
                    title={onCallToActionLabel || t('Global.Okay')}
                    accessibilityLabel={onCallToActionLabel || t('Global.Okay')}
                    testID={testIdWithKey('Okay')}
                    buttonType={ButtonType.ModalPrimary}
                    onPress={onCallToActionPressed}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default DismissiblePopupModal
