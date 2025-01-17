import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../contexts/theme'
import { Locales, storeLanguage } from '../localization'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'
interface Language {
  id: Locales
  value: string
}

const Language = () => {
  const { t, i18n } = useTranslation()
  const { ColorPallet, TextTheme, SettingsTheme } = useTheme()
  const [{ supportedLanguages }] = useServices([TOKENS.CONFIG])

  const languages: Language[] = supportedLanguages.map((lang) => ({
    id: lang,
    value: i18n.t(`Language.code`, { context: lang }),
  }))

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.brand.primaryBackground,
      marginHorizontal: 25,
    },
  })

  /**
   * Once user select the particular language from the list,
   * store user preference into the AsyncStorage
   *
   * @param {BlockSelection} language
   */
  const handleLanguageChange = async (language: Language) => {
    await i18n.changeLanguage(language.id as Locales)
    await storeLanguage(language.id)
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={languages}
        renderItem={({ item: language }) => {
          const { id, value }: Language = language
          return (
            <View style={[styles.section, styles.sectionRow]}>
              <Text style={TextTheme.title}>{value}</Text>
              <BouncyCheckbox
                accessibilityLabel={`${id === i18n.language ? t('Language.Checked') : t('Language.NotChecked')}`} // add on voice over the text checked / not checked after the text from value above
                accessibilityRole="radio"
                disableText
                fillColor={ColorPallet.brand.secondaryBackground}
                unfillColor={ColorPallet.brand.secondaryBackground}
                size={36}
                innerIconStyle={{ borderColor: ColorPallet.brand.primary, borderWidth: 2 }}
                ImageComponent={() => <Icon name="circle" size={18} color={ColorPallet.brand.primary}></Icon>}
                onPress={async () => await handleLanguageChange(language)}
                isChecked={id === i18n.language}
                disableBuiltInState
                testID={testIdWithKey(id.toLocaleLowerCase())}
              />
            </View>
          )
        }}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: SettingsTheme.groupBackground }}>
            <View style={styles.itemSeparator}></View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Language
