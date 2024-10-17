import { useCallback } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ColorPallet, SettingsTheme } from '../theme'

const Lockout = () => {
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

  const handleChange = useCallback(() => {
    // do something
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[{}]}
        renderItem={({ item: any }) => {
          return (
            <View>
              <Text>{'Look at this guy'}</Text>
              {/* <BouncyCheckbox
                accessibilityLabel={''}
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
              /> */}
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

export default Lockout
