import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import BulletPoint from '../components/inputs/BulletPoint'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'

export interface PINExplainerProps {
  continueCreatePIN: () => void
}

const PINExplainer: React.FC<PINExplainerProps> = ({ continueCreatePIN }) => {
  const { t } = useTranslation()
  const { ColorPalette, TextTheme, Assets } = useTheme()

  const style = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
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
    fill: ColorPalette.notification.infoText,
    height: 150,
    width: 150,
  }

  return (
    <SafeAreaView style={style.safeAreaView} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={style.scrollViewContentContainer}>
        <View>
          <ThemedText variant="headingTwo">{t('PINCreate.Explainer.PrimaryHeading')}</ThemedText>
          <ThemedText style={{ marginTop: 30, marginBottom: 30 }}>
            <Trans
              i18nKey="PINCreate.Explainer.PINReminder"
              components={{
                b: <ThemedText variant="bold" />,
              }}
              t={t}
            />
          </ThemedText>
        </View>
        <View style={style.imageContainer}>
          <Assets.svg.secureCheck {...imageDisplayOptions} />
        </View>
        <View>
          <ThemedText variant="headingFour">{t('PINCreate.Explainer.WhyNeedPin.Header')}</ThemedText>
          <ThemedText style={{ marginTop: 20, marginBottom: 20 }}>
            {t('PINCreate.Explainer.WhyNeedPin.Paragraph')}
          </ThemedText>
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
