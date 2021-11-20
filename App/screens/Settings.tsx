import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaScrollView, Text } from 'components'
import { useNavigation } from '@react-navigation/core'
import { mainColor, shadow } from '../globalStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'

const Settings: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <SafeAreaScrollView>
      <View style={styles.container}>
        <Text style={styles.groupHeader}>{t('Settings.AppPreferences')}</Text>

        <View style={styles.rowGroup}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Language')}>
            <Text>{t('Settings.Language')}</Text>
            <Icon name={'chevron-right'} size={25} color={mainColor} />
          </TouchableOpacity>
        </View>

        <Text style={styles.groupHeader}>{t('Settings.AboutApp')}</Text>
        <View style={styles.rowGroup}>
          <View style={styles.row}>
            <Text>{t('Settings.Version')}</Text>
            <Text>{t('Settings.VersionString')}</Text>
          </View>

          <View style={styles.row}>
            <Text>{t('Settings.AMA-RNVersion')}</Text>
            <Text>{t('Settings.AMA-RNVersionString')}</Text>
          </View>
        </View>
      </View>
    </SafeAreaScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginVertical: 15,
  },
  rowGroup: {
    borderRadius: 8,
    backgroundColor: shadow,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

export default Settings
