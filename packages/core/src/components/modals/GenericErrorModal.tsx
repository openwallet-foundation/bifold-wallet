import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import FauxHeader from '../../components/misc/FauxHeader'
import SafeAreaModal from '../../components/modals/SafeAreaModal'
import InfoBox, { InfoBoxType } from '../../components/misc/InfoBox'
import Button, { ButtonType } from '../../components/buttons/Button'
import { useTheme } from '../../contexts/theme'
import { useStore } from '../../contexts/store'

interface GenericErrorModalProps {
  errorTitle: string
  errorDescription: string
  visible: boolean
  onPressCTA: () => void
}

const GenericErrorModal: React.FC<GenericErrorModalProps> = ({
  errorTitle = '',
  errorDescription = '',
  visible = false,
  onPressCTA = () => {},
}: GenericErrorModalProps) => {
  const { ColorPalette, NavigationTheme } = useTheme()
  const { t } = useTranslation()
  const [ store ] = useStore()

  const useGenericErrorMessage = store.preferences.genericErrorMessages

  const style = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 40,
      backgroundColor: ColorPalette.brand.primaryBackground,
      justifyContent: 'space-between',
    },
    buttonContainer: {
      paddingBottom: 20,
    }
  })

  return (
    <SafeAreaModal
      style={{ backgroundColor: ColorPalette.brand.primaryBackground }}
      visible={visible}
      transparent={false}
      animationType={'none'}
      presentationStyle={'fullScreen'}
      statusBarTranslucent={true}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: NavigationTheme.colors.primary }} />
      <FauxHeader title={t('Global.AppName')} />
        <View style={style.container}>
          <InfoBox
            title={useGenericErrorMessage ? t('Error.GenericError.Title') : errorTitle}
            message={useGenericErrorMessage ? t('Error.GenericError.Message') : errorDescription}
            notificationType={InfoBoxType.Error}
            renderShowDetails
          />
          <View style={style.buttonContainer}>
            <Button
              title={t('GenericErrorModal.PrimaryCTA')}
              buttonType={ButtonType.Primary}
              onPress={onPressCTA}
            />
          </View>
        </View>
    </SafeAreaModal>
  )
}

export default GenericErrorModal
