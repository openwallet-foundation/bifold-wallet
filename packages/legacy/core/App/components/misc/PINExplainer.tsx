import React, { useEffect } from 'react'
/*
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthenticateStackParams, Screens } from '../../types/navigators'
*/
import { Trans, useTranslation } from 'react-i18next'
import Button, { ButtonType } from '../buttons/Button'
import BulletPoint from '../inputs/BulletPoint'
import { testIdWithKey } from '../../utils/testable'

import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

export interface PINExplainerProps {
  continueCreatePIN: () => void
}

const Component: React.FC<PINExplainerProps> = ({ continueCreatePIN }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    pageContainer: {
      height: '100%',
      justifyContent: 'space-between',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
  })

  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 150,
    width: 150,
  }
  
  // const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const pressBack = () => {
    // No handler on Back action yet
    // navigation.navigate(Screens.Terms)
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={style.screenContainer}>
        <View>
          <Text style={TextTheme.headingTwo}>{t('PINCreate.Explainer.PrimaryHeading')}</Text>
          <Text style={[TextTheme.normal, { marginTop: 30, marginBottom: 30 }]}>
            <Trans
              i18nKey="PINCreate.Explainer.PINReminder"
              components={{
                b: <Text style={TextTheme.labelTitle} />,
              }}
              t={t}
            />
          </Text>
        </View>
        <View style={style.imageContainer}>
          <Assets.svg.secureCheck {...imageDisplayOptions} />
        </View>
        <View>
          <Text style={TextTheme.headingFour}>{t('PINCreate.Explainer.WhyNeedPin.Header')}</Text>
          <Text style={[TextTheme.normal, { marginTop: 20, marginBottom: 20 }]}>{t('PINCreate.Explainer.WhyNeedPin.Paragraph')}</Text>
          <BulletPoint text={t('PINCreate.Explainer.WhyNeedPin.ParagraphList1')} textStyle={TextTheme.normal} />
          <BulletPoint text={t('PINCreate.Explainer.WhyNeedPin.ParagraphList2')} textStyle={TextTheme.normal} />
        </View>

        <View>
          <View style={{ paddingTop: 10 }}>
            <Button
              title={t('Global.Continue')}
              accessibilityLabel={t('Global.Continue')}
              testID={testIdWithKey('Continue')}
              onPress={continueCreatePIN}
              buttonType={ButtonType.Primary}
            />
          </View>
          <View style={[{ paddingTop: 10, marginBottom: 20 }]}>
            <Button
              title={t('Global.Back')}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('Back')}
              onPress={pressBack}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default Component
