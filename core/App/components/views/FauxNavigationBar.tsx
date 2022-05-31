import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'

const defaultIconSize = 26
const defaultStatusAndNavbarHeight = 90

interface FauxNavigationBarProps {
  title: string
  onHomeTouched?: GenericFn
}

const FauxNavigationBar: React.FC<FauxNavigationBarProps> = ({ title, onHomeTouched }) => {
  const { TextTheme, ColorPallet } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'flex-end',
      flexDirection: 'row',
      height: defaultStatusAndNavbarHeight,
      backgroundColor: ColorPallet.brand.primary,
      paddingBottom: 4,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 15,
    },
    label: {
      ...TextTheme.normal,
      color: ColorPallet.grayscale.white,
      flexGrow: 1,
      textAlign: 'center',
      paddingLeft: 26,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{title}</Text>
        {onHomeTouched && (
          <TouchableOpacity
            accessibilityLabel={t('Global.Home')}
            testID={testIdWithKey('HomeButton')}
            onPress={onHomeTouched}
          >
            <Icon name="home" size={defaultIconSize} color={'white'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FauxNavigationBar
