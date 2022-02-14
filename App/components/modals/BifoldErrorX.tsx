import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TextTheme, ColorPallet } from '../../theme'
import { GenericFn } from '../../types/fn'

import Button, { ButtonType } from 'components/buttons/Button'

const iconSize = 30
const { width } = Dimensions.get('window')

interface BifoldErrorProps {
  title: string
  message: string
  code: number
  onPress: GenericFn
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.notification.error,
    borderColor: ColorPallet.notification.errorBorder,
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 25,
    minWidth: width - 2 * 25,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  bodyContainer: {
    // flexGrow: 1,
    flexDirection: 'column',
    marginLeft: 10 + iconSize,
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: ColorPallet.notification.errorText,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    marginVertical: 15,
    paddingBottom: 10,
    color: ColorPallet.notification.errorText,
  },
  icon: {
    marginRight: 10,
    alignSelf: 'center',
  },
})

const BifoldErrorX: React.FC<BifoldErrorProps> = ({ title, message, code, onPress }) => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.icon]}>
          <Icon name={'error'} size={iconSize} color={ColorPallet.notification.errorIcon} />
        </View>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyText}>{message}</Text>
        <Text style={styles.bodyText}>{`${t('Global.ErrorCode')} ${code}`}</Text>
        <Button buttonType={ButtonType.Primary} title={t('Global.Okay')} onPress={onPress} />
      </View>
    </View>
  )
}

export default BifoldErrorX
