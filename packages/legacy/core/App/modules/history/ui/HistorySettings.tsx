import { useAgent } from '@credo-ts/react-hooks'
import { ParamListBase } from '@react-navigation/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../../../components/buttons/Button-api'
import KeyboardView from '../../../components/views/KeyboardView'
import { TOKENS, useServices } from '../../../container-api'
import { useAnimatedComponents } from '../../../contexts/animated-components'
import { useTheme } from '../../../contexts/theme'
import { Screens } from '../../../types/navigators'
import { testIdWithKey } from '../../../utils/testable'
import { HistoryBlockSelection, IHistoryManager } from '../types'

import SingleSelectBlock from './components/SingleSelectBlock'
import { ThemedText } from '../../../components/texts/ThemedText'

interface HistorySettingsProps extends StackScreenProps<ParamListBase, Screens.HistorySettings> {}

const HistorySettings: React.FC<HistorySettingsProps> = () => {
  const [continueEnabled] = useState(true)
  const [isLoading] = useState(false)
  const { t } = useTranslation()

  const { ColorPallet } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const actionButtonLabel = t('Global.SaveSettings')
  const actionButtonTestId = testIdWithKey('Save')
  const [Button, logger, loadHistory] = useServices([TOKENS.COMP_BUTTON, TOKENS.UTIL_LOGGER, TOKENS.FN_LOAD_HISTORY])
  const { agent } = useAgent()
  const historyManager: IHistoryManager | undefined = agent ? loadHistory(agent) : undefined

  //State
  const [initialHistory, setInitialHistory] = useState<HistoryBlockSelection | undefined>() // Initial history settings option
  const [historyOptionSelected, setHistoryOptionSelected] = useState<HistoryBlockSelection | undefined>(initialHistory) // Selected history settings option

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    title: {
      marginTop: 16,
    },
    deleteButtonText: {
      alignSelf: 'flex-start',
      color: '#CD0000', //TODO: Use Bifold alert color
    },
    deleteButton: {
      marginBottom: 16,
    },
    gap: {
      marginTop: 10,
      marginBottom: 10,
    },

    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
  })

  const onSelectHistory = (newHistoryOption: HistoryBlockSelection) => {
    // console.log('on select history:', JSON.stringify(newHistoryOption))
    //TODO: Impliment warning of old history clearing on the below condition
    // if (newHistoryOption && newHistoryOption.key) {
    //   if ((initialHistory?.key as number) > newHistoryOption.key) {
    //     setShowWarningDisclaimer(true)
    //   } else {
    //     setShowWarningDisclaimer(false)
    //   }
    // }
    setHistoryOptionSelected(newHistoryOption)
    //TODO: Impliment success alert
    // setIsSuccess(false)
  }

  const handleSaveHistorySettings = useCallback(async () => {
    if (!historyManager) {
      logger.error(`[${HistorySettings.name}]: historyManager undefined!`)
      return
    }
    try {
      if (!historyOptionSelected && initialHistory) {
        await historyManager.handleStoreHistorySettings(initialHistory)
      } else {
        await historyManager.handleStoreHistorySettings(historyOptionSelected)
      }
      //TODO: Impliment Alert
      //   setShowWarningDisclaimer(false)
      //   setIsSuccess(true)
      //   scrollViewRef.current?.scrollTo({
      //     y: 0,
      //     animated: true,
      //   })
      // console.log('History option saved')
    } catch (e: unknown) {
      //TODO: Impliment Alert
      // console.log('Error:', e)
      //   log(`[${SettingsActivityHistory.name}]: Handle history save: ${e}`, LogLevel.error)
      //   Toast.show({
      //     type: 'error',
      //     text1: (e as Error)?.message || t('Global.Failure'),
      //   })
    }
  }, [historyManager, logger, historyOptionSelected, initialHistory])

  /**
   * Find current set history
   */
  useEffect(() => {
    const getSavedHistorySettingsOption = async () => {
      if (!historyManager) {
        logger.error(`[${HistorySettings.name}]:[getSavedHistorySettingsOption] historyManager undefined!`)
        return
      }
      const storedHistorySettingsOption = await historyManager.getStoredHistorySettingsOption()
      if (storedHistorySettingsOption === 'Never') {
        //TODO: Impliment "Never" option
        //   setIsActivityHistoryDisabled(true)
      } else {
        setInitialHistory(
          storedHistorySettingsOption
            ? historyManager.getHistorySettingsOptionList().find((l) => l.id === storedHistorySettingsOption)
            : undefined
        )
      }
    }

    getSavedHistorySettingsOption().catch((e) => {
      logger.error(`[${HistorySettings.name}]:[getSavedHistorySettingsOption] Error: ${e}`)
    })
  }, [historyManager, logger])

  return (
    <KeyboardView>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <View>
            <ThemedText variant="headerTitle" style={style.title}>
              {t('ActivityHistory.Title')}
            </ThemedText>
            <ThemedText style={style.title}>{t('ActivityHistory.Description')}</ThemedText>
            <View style={style.gap} />
            <SingleSelectBlock
              initialSelect={initialHistory}
              selection={historyManager?.getHistorySettingsOptionList()}
              onSelect={onSelectHistory}
            />
          </View>
        </View>
        <View style={style.controlsContainer}>
          <Button
            title={actionButtonLabel}
            testID={actionButtonTestId}
            accessibilityLabel={actionButtonLabel}
            buttonType={ButtonType.Primary}
            onPress={handleSaveHistorySettings}
          >
            {!continueEnabled && isLoading ? <ButtonLoading /> : null}
          </Button>
          <View style={{ marginBottom: 10 }} />
          <Button
            title={t('ActivityHistory.StopKeepingHistory')}
            testID={actionButtonTestId}
            accessibilityLabel={actionButtonLabel}
            buttonType={ButtonType.Secondary}
            onPress={async () => {
              // console.log('save history')
            }}
          >
            {!continueEnabled && isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>
      </View>
    </KeyboardView>
  )
}

export default HistorySettings
