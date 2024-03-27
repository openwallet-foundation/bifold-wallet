import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import moment, { Moment } from 'moment'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../../../components/buttons/Button-api'
import KeyboardView from '../../../components/views/KeyboardView'
import { TOKENS, useContainer } from '../../../container-api'
import { useAnimatedComponents } from '../../../contexts/animated-components'
import { useTheme } from '../../../contexts/theme'
import { HistoryStackParams } from '../../../types/navigators'
import { testIdWithKey } from '../../../utils/testable'
import { HistorySettingsOptionStorageKey, useHistory } from '../context/history'
import { CustomRecord, HistoryRecord, RecordType } from '../types'

import HistoryListItem from './components/HistoryListItem'

type HistoryPageProps = StackScreenProps<HistoryStackParams>

const HistoryPage: React.FC<HistoryPageProps> = ({ navigation }) => {
  //   const updatePin = (route.params as any)?.updatePin
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState<CustomRecord[]>()
  const { t } = useTranslation()
  const { getHistoryItems, findGenericRecordById, removeGenericRecord } = useHistory()

  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const actionButtonLabel = t('Global.SaveSettings')
  const actionButtonTestId = testIdWithKey('Save')
  const container = useContainer()
  const Button = container.resolve(TOKENS.COMP_BUTTON)

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
    const allRecords = await getHistoryItems({ type: RecordType.HistoryRecord })

    const historySettingOption = await AsyncStorage.getItem(HistorySettingsOptionStorageKey.HistorySettingsOption)

    // Filter History record data according to given date.
    const filterDataByGivenDate = (data: CustomRecord[], givenDate: Moment) =>
      data.filter((x: CustomRecord) => moment(x.content.createdAt, 'DD-MM-YYYY').isSameOrBefore(givenDate))

    if (historySettingOption !== 'Always' && historySettingOption !== null) {
      let givenDate = moment()
      if (historySettingOption === '1 month') {
        givenDate = moment().subtract(1, 'month')
      } else if (historySettingOption === '6 month') {
        givenDate = moment().subtract(6, 'month')
      } else if (historySettingOption === '1 year') {
        givenDate = moment().subtract(1, 'year')
      }
      // Filter history record data and get the ones that needs to be deleted.
      const selectedHistoryRecords = filterDataByGivenDate(allRecords, givenDate)

      // Remove history past the selected date.
      for await (const record of selectedHistoryRecords) {
        const recordHistory = record.content as HistoryRecord
        if (!recordHistory || !recordHistory.id) {
          return
        }
        const deleteRecord = await findGenericRecordById(recordHistory.id)
        if (!deleteRecord) {
          return
        }
        await removeGenericRecord(deleteRecord)
      }
    }

    const newAllRecords = await getHistoryItems({ type: RecordType.HistoryRecord })

    //TODO: Impliment history sort
    // if (!sortHistoryBy) {
    // Sort history records in descending order
    newAllRecords.sort((objA, objB) => Number(objB.content.createdAt) - Number(objA.content.createdAt))
    // }

    if (newAllRecords) {
      setHistoryItems(newAllRecords)
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
                console.log('save history')
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
              renderItem={(element) => <HistoryListItem item={element.item} />}
            />
          </View>
        </View>
      </View>
    </KeyboardView>
  )
}

export default HistoryPage
