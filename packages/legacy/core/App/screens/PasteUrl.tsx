import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { TOKENS, useContainer } from '../container-api'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { ConnectStackParams } from '../types/navigators'
import { connectFromScanOrDeepLink } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

export type PasteProps = StackScreenProps<ConnectStackParams>

const PasteUrl: React.FC<PasteProps> = ({ navigation }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const [pastedContent, setPastedContent] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | undefined>()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const container = useContainer()
  const logger = container.resolve(TOKENS.UTIL_LOGGER)
  const { enableImplicitInvitations, enableReuseConnections } = useConfiguration()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    content: {
      margin: 20,
    },
    description: {
      ...TextTheme.normal,
      marginBottom: 20,
    },
    textBox: {
      ...TextTheme.normal,
      textAlignVertical: 'top',
      borderColor: ColorPallet.grayscale.darkGrey,
      borderWidth: 1,
      borderRadius: 5,
      backgroundColor: ColorPallet.grayscale.lightGrey,
    },
    buttonContainer: {
      margin: 20,
    },
  })

  const processPastedContent = async () => {
    try {
      await connectFromScanOrDeepLink(
        pastedContent,
        agent,
        logger,
        navigation?.getParent(),
        false, // isDeepLink
        enableImplicitInvitations,
        enableReuseConnections
      )
    } catch (err: unknown) {
      setErrorMessage({ title: t('PasteUrl.ErrorInvalidUrl'), message: t('PasteUrl.ErrorInvalidUrlDescription') })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Modal visible={!!errorMessage} testID={testIdWithKey('ErrorModal')} animationType="fade" transparent>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <InfoBox
              notificationType={InfoBoxType.Error}
              title={errorMessage?.title ?? ''}
              description={errorMessage?.message ?? ''}
              onCallToActionPressed={() => setErrorMessage(undefined)}
              onCallToActionLabel={t('Global.TryAgain')}
            />
          </View>
        </Modal>
        <View style={styles.content}>
          <Text style={styles.description}>{t('PasteUrl.PasteUrlDescription')}</Text>
          <TextInput
            testID={testIdWithKey('PastedUrl')}
            style={styles.textBox}
            numberOfLines={15}
            multiline
            value={pastedContent}
            onChangeText={(text) => setPastedContent(text)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID={testIdWithKey('ScanPastedUrlDisabled')}
            disabled={pastedContent.length > 0}
            onPress={() => {
              setErrorMessage({
                title: t('PasteUrl.ErrorTextboxEmpty'),
                message: t('PasteUrl.ErrorTextboxEmptyDescription'),
              })
            }}
          >
            <Button
              title={t('Global.Continue')}
              accessibilityLabel={t('Global.Continue')}
              testID={testIdWithKey('ScanPastedUrl')}
              buttonType={ButtonType.Primary}
              onPress={processPastedContent}
              disabled={pastedContent.length === 0}
            />
          </TouchableOpacity>
          <View style={{ marginTop: 15 }}>
            <Button
              title={t('PasteUrl.Clear')}
              accessibilityLabel={t('PasteUrl.Clear')}
              testID={testIdWithKey('ClearPastedUrl')}
              buttonType={ButtonType.Secondary}
              onPress={() => {
                setPastedContent('')
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PasteUrl
