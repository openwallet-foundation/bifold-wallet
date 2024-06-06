import { useAgent } from '@credo-ts/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
// import { TouchableOpacity } from 'react-native-gesture-handler'

import { ButtonType } from '../../../components/buttons/Button-api'
import KeyboardView from '../../../components/views/KeyboardView'
import { TOKENS, useContainer } from '../../../container-api'
import { useAnimatedComponents } from '../../../contexts/animated-components'
import { useTheme } from '../../../contexts/theme'
import { HistoryStackParams } from '../../../types/navigators'
import { testIdWithKey } from '../../../utils/testable'
import { CustomRecord, IHistoryManager, RecordType } from '../types'

import HistoryListItem from './components/HistoryListItem'

type HistoryPageProps = StackScreenProps<HistoryStackParams>

const HistoryPage: React.FC<HistoryPageProps> = () => {
  //   const updatePin = (route.params as any)?.updatePin
  const [continueEnabled] = useState(true)
  const [isLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState<CustomRecord[]>()
  const { t } = useTranslation()
  const container = useContainer()
  const { agent } = useAgent()
  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()

  const actionButtonLabel = t('Global.SaveSettings')
  const actionButtonTestId = testIdWithKey('Save')
  const Button = container.resolve(TOKENS.COMP_BUTTON)
  const logger = container.resolve(TOKENS.UTIL_LOGGER)
  const historyManager: IHistoryManager | undefined = agent
    ? container.resolve(TOKENS.FN_LOAD_HISTORY)(agent)
    : undefined

  //State

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

  /** Load history */
  const getAllHistory = async () => {
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

  //UI
  const renderEmptyListComponent = () => {
    return (
      <View>
        <Text style={[style.title, TextTheme.headerTitle]}>{t('ActivityHistory.NoHistory')}</Text>
      </View>
    )
  }

  const renderHistoryListItem = (item: CustomRecord) => {
    return <HistoryListItem item={item} />
  }

  useFocusEffect(
    useCallback(() => {
      getAllHistory()
    }, [])
  )

  return (
    <KeyboardView>
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
    </KeyboardView>
  )
}

export default HistoryPage
