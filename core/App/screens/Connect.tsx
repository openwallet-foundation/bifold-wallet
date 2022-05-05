import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const Connect = ({ navigation }: any) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    outerContainer: {
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      paddingBottom: 15,
    },
    innerContainer: {
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      backgroundColor: ColorPallet.grayscale.lightGrey,
      height: '45%',
      padding: 20,
      marginHorizontal: 15,
      borderRadius: 25,
    },
    text: {
      ...TextTheme.normal,
      color: ColorPallet.grayscale.darkGrey,
      width: '50%',
      textAlign: 'center',
    },
  })
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <Icon name="camera" size={100} color="#000" />
        <Text style={styles.text}>{t('Connection.Camera')}</Text>
        <Button
          title={t('Connection.Scan')}
          accessibilityLabel={t('Connection.Scan')}
          testID={testIdWithKey('Scan a code')}
          onPress={() => {
            navigation.navigate(TabStacks.ConnectStack, { screen: Screens.Scan })
          }}
          buttonType={ButtonType.Primary}
        />
      </View>
      <View style={styles.innerContainer}>
        <Icon name="qrcode" size={100} color="#000" />
        <Text style={styles.text}>{t('Connection.DisplayCode')}</Text>
        <Button
          title={t('Connection.Display')}
          accessibilityLabel={t('Connection.Display')}
          testID={testIdWithKey('Display a code')}
          onPress={() => {
            navigation.navigate(TabStacks.ConnectStack, { screen: Screens.DisplayCode })
          }}
          buttonType={ButtonType.Primary}
        />
      </View>
    </View>
  )
}

export default Connect
