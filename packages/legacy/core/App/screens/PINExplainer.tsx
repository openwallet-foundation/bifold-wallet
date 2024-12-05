import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import BulletPoint from '../components/inputs/BulletPoint'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

export interface PINExplainerProps {
  continueCreatePIN: () => void
}

const PINExplainer: React.FC<PINExplainerProps> = ({ continueCreatePIN }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()

  const style = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    scrollViewContentContainer: {
      padding: 20,
      flexGrow: 1,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
  })

  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 150,
    width: 150,
  }

  return (
    <SafeAreaView style={style.safeAreaView} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={style.scrollViewContentContainer}>
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
          <Text style={[TextTheme.normal, { marginTop: 20, marginBottom: 20 }]}>
            {t('PINCreate.Explainer.WhyNeedPin.Paragraph')}
          </Text>
          <BulletPoint text={t('PINCreate.Explainer.WhyNeedPin.ParagraphList1')} textStyle={TextTheme.normal} />
          <BulletPoint text={t('PINCreate.Explainer.WhyNeedPin.ParagraphList2')} textStyle={TextTheme.normal} />
        </View>
      </ScrollView>
      <View style={style.footer}>
        <Button
          title={t('Global.Continue')}
          accessibilityLabel={t('Global.Continue')}
          testID={testIdWithKey('ContinueCreatePIN')}
          onPress={continueCreatePIN}
          buttonType={ButtonType.Primary}
        />
      </View>
    </SafeAreaView>
  )
}

export default PINExplainer
