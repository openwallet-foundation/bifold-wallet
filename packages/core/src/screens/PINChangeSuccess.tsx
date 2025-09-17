/* eslint-disable react/prop-types */
import { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'

import KeyboardView from '../components/views/KeyboardView'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { ButtonType } from '../components/buttons/Button-api'
import usePreventScreenCapture from '../hooks/screen-capture'
import { useTheme } from '../contexts/theme'
import { TOKENS, useServices } from '../container-api'
import { testIdWithKey } from '../utils/testable'
import { Screens } from '../types/navigators'
import { SettingStackParams } from '../types/navigators'

const ChangePINSuccessScreen: React.FC<StackScreenProps<SettingStackParams, Screens.ChangePINSuccess>> = ({
  navigation,
}) => {
  const { ColorPalette } = useTheme()
  const { t } = useTranslation()
  const [{ preventScreenCapture }, Button] = useServices([TOKENS.CONFIG, TOKENS.COMP_BUTTON])

  usePreventScreenCapture(preventScreenCapture)

  const style = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
  })

  const onPressContinue = useCallback(() => {
    navigation?.navigate(Screens.Settings)
  }, [navigation])

  return (
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.container}>
        <View style={{ marginTop: 10, marginBottom: 30 }}>
          <InfoBox
            notificationType={InfoBoxType.Success}
            title={t('PINChangeSuccess.InfoBox.Title')}
            message={t('PINChangeSuccess.InfoBox.Description')}
            renderShowDetails
          />
        </View>
        <Button
          title={t('PINChangeSuccess.PrimaryButton')}
          testID={testIdWithKey('GoToSettings')}
          accessibilityLabel={t('PINChangeSuccess.PrimaryButton')}
          buttonType={ButtonType.Primary}
          onPress={onPressContinue}
        />
      </View>
    </KeyboardView>
  )
}

export default ChangePINSuccessScreen
