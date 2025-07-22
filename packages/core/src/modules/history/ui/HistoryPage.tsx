import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'

import { ButtonType } from '../../../components/buttons/Button-api'
import { TOKENS, useServices } from '../../../container-api'
import { useAnimatedComponents } from '../../../contexts/animated-components'
import { useTheme } from '../../../contexts/theme'
import { HistoryStackParams } from '../../../types/navigators'
import { testIdWithKey } from '../../../utils/testable'
import { CustomRecord, RecordType } from '../types'

import HistoryListItem from './components/HistoryListItem'
import { ThemedText } from '../../../components/texts/ThemedText'

type HistoryPageProps = StackScreenProps<HistoryStackParams>

const HistoryPage: React.FC<HistoryPageProps> = () => {
  const [continueEnabled] = useState(true)
  const [isLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState<CustomRecord[]>()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()

  const actionButtonLabel = t('Global.SaveSettings')
  const actionButtonTestId = testIdWithKey('Save')
  const [Button, logger, historyManagerCurried] = useServices([
    TOKENS.COMP_BUTTON,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
  ])

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPalette.brand.primaryBackground,
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

  //UI
  const renderEmptyListComponent = () => {
    return (
      <View>
        <ThemedText variant="headerTitle" style={style.title}>
          {t('ActivityHistory.NoHistory')}
        </ThemedText>
      </View>
    )
  }

  const renderHistoryListItem = (item: CustomRecord) => {
    return <HistoryListItem item={item} />
  }

  useEffect(() => {
    const getHistory = async () => {
      if (!agent) {
        logger.error(`[${HistoryPage.name}][getAllHistory]: agent undefined!`)
        return
      }
      const historyManager = historyManagerCurried(agent)
      if (!historyManager) {
        logger.error(`[${HistoryPage.name}][getAllHistory]: historyManager undefined!`)
        return
      }
      const allRecords = await historyManager.getHistoryItems({ type: RecordType.HistoryRecord })
      allRecords.sort((objA, objB) => Number(objB.content.createdAt) - Number(objA.content.createdAt))

      if (allRecords) {
        setHistoryItems(allRecords)
      }
    }

    getHistory().catch((e) => {
      logger.error(`[${HistoryPage.name}][getAllHistory]: ${e}`)
    })
  }, [historyManagerCurried, logger, agent])

  return (
    <View style={style.screenContainer}>
      <View style={style.contentContainer}>
        <View>
          <Button
            title={t('History.SortFilterButton')}
            testID={actionButtonTestId}
            accessibilityLabel={actionButtonLabel}
            buttonType={ButtonType.Secondary}
            onPress={async () => {
              //TODO: Save settings
              // console.log('save history')
            }}
          >
            {!continueEnabled && isLoading ? <ButtonLoading /> : null}
          </Button>
          <View style={style.gap} />

          <FlatList
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            data={historyItems}
            ListEmptyComponent={renderEmptyListComponent}
            renderItem={(element) => renderHistoryListItem(element.item)}
          />
        </View>
      </View>
    </View>
  )
}

export default HistoryPage
