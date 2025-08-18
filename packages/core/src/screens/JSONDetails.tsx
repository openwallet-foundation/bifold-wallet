import { SafeAreaView } from 'react-native-safe-area-context'
import { View, StyleSheet, Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import { ThemedText } from '../components/texts/ThemedText'
import { StackScreenProps } from '@react-navigation/stack'
import { ContactStackParams, Screens } from '../types/navigators'
import Button, { ButtonType } from '../components/buttons/Button'
import { testIdWithKey } from '../utils/testable'
import { ScrollView } from 'react-native-gesture-handler'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-toast-message'
import { ToastType } from '../components/toast/BaseToast'
import { useNetInfo } from '@react-native-community/netinfo'

type JSONDetailsProps = StackScreenProps<ContactStackParams, Screens.JSONDetails>

const JSONDetails = ({ route }: JSONDetailsProps) => {
  if (!route?.params) {
    throw new Error('JSONDetails route params were not set properly')
  }
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const netInfo = useNetInfo()
  const jsonBlob = JSON.stringify({ caller_info: route.params.jsonBlob, network_info: netInfo }, null, 2)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
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
      backgroundColor: ColorPalette.brand.secondaryBackground,
      height: '75%',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 5,
    },
  })

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(jsonBlob)
      Toast.show({
        type: ToastType.Success,
        text1: t('JSONDetails.CopiedSuccess'),
      })
    } catch (e) {
      Toast.show({
        type: ToastType.Error,
        text1: `${t('JSONDetails.CopiedError')}: ${e}`,
      })
    }
  }

  const shareJSON = async () => {
    await Share.share({
      message: jsonBlob,
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View>
        <ScrollView style={styles.jsonContainer} testID={testIdWithKey('JSONDetails.ScrollView')}>
          <ThemedText>{jsonBlob}</ThemedText>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={t('JSONDetails.Share')}
            buttonType={ButtonType.Primary}
            testID={testIdWithKey('Share')}
            accessibilityLabel={t('JSONDetails.Share')}
            onPress={() => {
              shareJSON()
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
              copyToClipboard()
            }}
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default JSONDetails
