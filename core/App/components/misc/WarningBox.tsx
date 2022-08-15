import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Dimensions } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

export interface props {
  title?: string
  body?: string
  confirm?: string
  abort?: string
  submit?: () => void
}

const WarningBox = (props: props) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const styles = StyleSheet.create({
    container: theme.ModalTheme.container,
    wrapper: theme.ModalTheme.wrapper,
    title: theme.ModalTheme.title,
    body: theme.ModalTheme.body,
    button: theme.ModalTheme.button,
  })

  return (
    <View style={[styles.container]}>
      <View>
        <Text style={[styles.title]} testID={testIdWithKey('title')}>
          {t(props.title)}
        </Text>
      </View>
      <View>
        <Text style={[styles.body]} testID={testIdWithKey('body')}>
          {t(props.body)}
        </Text>
      </View>
      <View style={[styles.wrapper]}>
        <Button
          title={t(props.abort)}
          testID={testIdWithKey('abort')}
          accessibilityLabel={t('abort')}
          buttonType={ButtonType.Secondary}
          onPress={props.submit}
          styles={[styles.button]}
        />
        <Button
          title={t(props.confirm)}
          testID={testIdWithKey('confirm')}
          accessibilityLabel={t('confirm')}
          buttonType={ButtonType.Primary}
          onPress={props.submit}
          styles={[styles.button]}
        />
      </View>
    </View>
  )
}

export default WarningBox
