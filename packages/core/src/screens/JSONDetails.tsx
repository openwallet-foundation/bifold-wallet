import { SafeAreaView } from 'react-native-safe-area-context'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import { ThemedText } from '../components/texts/ThemedText'
import { StackScreenProps } from '@react-navigation/stack'
import { ContactStackParams, Screens } from '../types/navigators'
import Button, { ButtonType } from '../components/buttons/Button'
import { testIdWithKey } from '../utils/testable'
import { ScrollView } from 'react-native-gesture-handler'

type JSONDetailsProps = StackScreenProps<ContactStackParams, Screens.JSONDetails>

const JSONDetails = ({ route }: JSONDetailsProps) => {
  if (!route?.params) {
    throw new Error('JSONDetails route params were not set properly')
  }
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const { jsonBlob } = route.params
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    title: {
      marginBottom: 16,
    },
    buttonContainer: {
      width: '100%',
      paddingVertical: 8,
    },
    jsonContainer: {
      padding: 16,
      backgroundColor: ColorPallet.brand.secondaryBackground,
      height: '75%',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 5,
    },
  })

  const copyToClipboard = () => {
    // copy jsonBlob to clipboard
  }

  const download = () => {
    // download jsonBlob as a file
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View>
        <ScrollView style={styles.jsonContainer} testID={testIdWithKey('JSONDetails.ScrollView')}>
          <ThemedText>{jsonBlob}</ThemedText>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={t('JSONDetails.Download')}
            buttonType={ButtonType.Primary}
            testID={testIdWithKey('Download')}
            accessibilityLabel={t('JSONDetails.Download')}
            onPress={() => {
              download()
            }}
          ></Button>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={t('JSONDetails.Copy')}
            buttonType={ButtonType.Secondary}
            testID={testIdWithKey('CopyToClipboard')}
            accessibilityLabel={t('JSONDetails.Copy')}
            onPress={() => {
              // copy json to clipboard
              copyToClipboard()
            }}
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default JSONDetails
