import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface Action {
  text: string
  icon: React.FC
  onPress: () => void
}

interface Props {
  actions: Action[] | undefined
  onDismiss: () => void
}

const ActionSlider: React.FC<Props> = ({ actions, onDismiss }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    centeredView: {
      marginTop: 'auto',
      justifyContent: 'flex-end',
    },
    outsideListener: {
      height: '100%',
    },
    modalView: {
      backgroundColor: ColorPallet.grayscale.white,
      borderTopStartRadius: 20,
      borderTopEndRadius: 20,
      shadowColor: '#000',
      padding: 20,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    drawerTitleText: {
      ...TextTheme.bold,
      textAlign: 'center',
      marginVertical: 10,
    },
    drawerContentText: {
      ...TextTheme.normal,
    },
    drawerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginVertical: 12,
    },
    drawerRowItem: {
      color: ColorPallet.grayscale.black,
    },
  })

  return (
    <Modal animationType="slide" transparent={true} onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.outsideListener} onPress={onDismiss} />
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            testID={testIdWithKey('Close')}
            accessibilityLabel={t('Global.Close')}
            accessibilityRole={'button'}
            onPress={onDismiss}
            hitSlop={hitSlop}
            style={{ alignSelf: 'flex-end' }}
          >
            <Icon name="window-close" size={35} style={styles.drawerRowItem}></Icon>
          </TouchableOpacity>
          {actions &&
            actions.map((action) => {
              return (
                <TouchableOpacity
                  key={action.text}
                  testID={testIdWithKey(action.text)}
                  accessibilityLabel={testIdWithKey(action.text)}
                  accessibilityRole="button"
                  style={styles.drawerRow}
                  onPress={action.onPress}
                >
                  <action.icon />
                  <Text style={{ ...styles.drawerRowItem, marginLeft: 5 }}>{action.text}</Text>
                </TouchableOpacity>
              )
            })}
        </View>
      </View>
    </Modal>
  )
}

export default ActionSlider
