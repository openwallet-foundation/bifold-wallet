/* eslint-disable react/prop-types */
import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'

import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { ButtonType } from '../components/buttons/Button-api'
import usePreventScreenCapture from '../hooks/screen-capture'
import { useTheme } from '../contexts/theme'
import { TOKENS, useServices } from '../container-api'
import { testIdWithKey } from '../utils/testable'
import { Screens } from '../types/navigators'
import { SettingStackParams } from '../types/navigators'
import ScreenWrapper from '../components/views/ScreenWrapper'

const ChangePINSuccessScreen: React.FC<StackScreenProps<SettingStackParams, Screens.ChangePINSuccess>> = ({
  navigation,
}) => {
  const { ColorPalette, Spacing } = useTheme()
  const { t } = useTranslation()
  const [{ preventScreenCapture }, Button] = useServices([TOKENS.CONFIG, TOKENS.COMP_BUTTON])

  usePreventScreenCapture(preventScreenCapture)

  const style = StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.md,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
  })

  const onPressContinue = useCallback(() => {
    navigation?.navigate(Screens.Settings)
  }, [navigation])

  return (
    <ScreenWrapper keyboardActive padded={false}>
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
    </ScreenWrapper>
  )
}

export default ChangePINSuccessScreen
