import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { PINValidationsType } from '../../utils/PINValidation'
import { ThemedText } from '../texts/ThemedText'

interface PINValidationHelperProps {
  validations: PINValidationsType[]
}

const iconSize = 24

const PINValidationHelper: React.FC<PINValidationHelperProps> = ({ validations }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  return (
    <View style={{ marginBottom: 16 }}>
      {validations.map((validation, index) => (
        <View style={{ flexDirection: 'row' }} key={index}>
          {validation.isInvalid ? (
            <Icon
              accessibilityLabel={t('PINCreate.Helper.ClearIcon')}
              name="clear"
              size={iconSize}
              color={ColorPallet.notification.errorIcon}
            />
          ) : (
            <Icon
              accessibilityLabel={t('PINCreate.Helper.CheckIcon')}
              name="check"
              size={iconSize}
              color={ColorPallet.notification.successIcon}
            />
          )}
          <ThemedText style={{ paddingLeft: 4 }}>
            {t(`PINCreate.Helper.${validation.errorName}`, validation?.errorTextAddition)}
          </ThemedText>
        </View>
      ))}
    </View>
  )
}

export default PINValidationHelper
