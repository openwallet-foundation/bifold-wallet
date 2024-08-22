import React, { useEffect, useMemo, useState, useRef } from 'react'
import { View, StyleSheet, Text } from 'react-native'

import Button, { ButtonType } from '../../components/buttons/Button'
import ConnectionAlert from '../../components/misc/ConnectionAlert'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'
import { useTranslation } from 'react-i18next'
import { useAnimatedComponents } from '../../contexts/animated-components'
import InfoTextBox from '../../components/texts/InfoTextBox'
import { InfoBoxType } from '.././misc/InfoBox'

type LoadingPlaceholderProps = {
  timeoutDurationInMs: number
  onCancelTouched: () => void
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ timeoutDurationInMs, onCancelTouched }) => {
  const { ColorPallet, ListItems, TextTheme, HomeTheme } = useTheme()
  const { t } = useTranslation()
  const { RecordLoading } = useAnimatedComponents()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [overtime, setOvertime] = useState(false)

  useEffect(() => {
    if (timeoutDurationInMs === 0) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setOvertime(true)
    }, timeoutDurationInMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeoutDurationInMs])

  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    pageContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    pageMargin: {
      marginHorizontal: 20,
    },
    pageFooter: {
      marginVertical: 15,
    },
    headerTextContainer: {
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
    link: {
      ...ListItems.recordAttributeText,
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    valueContainer: {
      minHeight: ListItems.recordAttributeText.fontSize,
      paddingVertical: 4,
    },
    detailsButton: {
      ...ListItems.recordAttributeText,
      color: ColorPallet.brand.link,
      textDecorationLine: 'underline',
    },
    cardLoading: {
      flex: 1,
      flexGrow: 1,
      borderRadius: 15,
    },
    noNewUpdatesText: {
      ...HomeTheme.noNewUpdatesText,
      flexWrap: 'wrap',
    },
  })

  return (
    <View>
      <Text>{'Some key step is going on'}</Text>
      <View style={styles.pageMargin}>
        {overtime && (
          <View style={{ paddingTop: 20, overflow: 'hidden' }}>
            <InfoTextBox type={InfoBoxType.Info}>
              <View style={{ backgroundColor: 'yellow' }}>
                <Text
                  style={[styles.noNewUpdatesText, { fontWeight: 'bold', marginBottom: 20 }]}
                  testID={testIdWithKey('NoNewUpdates')}
                >
                  {'This is slower than usual'}
                </Text>
                <Text
                  style={[styles.noNewUpdatesText, { backgroundColor: 'red' }]}
                  testID={testIdWithKey('NoNewUpdates')}
                >
                  {'Check your internet connection and try again. '}
                </Text>
              </View>
            </InfoTextBox>
          </View>
        )}

        <Text style={[styles.noNewUpdatesText, { marginTop: 25, marginBottom: 10 }]}>
          {"You'll be requested to share the following information."}
        </Text>

        <View style={styles.cardLoading}>
          <RecordLoading />
          <RecordLoading style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={[styles.pageFooter, styles.pageMargin]}>
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Cancel')}
            accessibilityLabel={t('Global.Cancel')}
            testID={testIdWithKey('Cancel')}
            buttonType={ButtonType.Primary}
            onPress={onCancelTouched}
          />
        </View>
      </View>
    </View>
  )
}

export default LoadingPlaceholder
