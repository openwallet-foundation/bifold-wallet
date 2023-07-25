import { Field } from '@hyperledger/aries-oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'

export interface RecordProps {
  header?: () => React.ReactElement | null
  footer?: () => React.ReactElement | null
  fields: Field[]
  hideFieldValues?: boolean
  field?: (field: Field, index: number, fields: Field[]) => React.ReactElement | null
}

const Record: React.FC<RecordProps> = ({ header, footer, fields, hideFieldValues = false, field = null }) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])
  const [showAll, setShowAll] = useState<boolean>(false)
  const { ListItems, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    linkContainer: {
      ...ListItems.recordContainer,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    link: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
    },
  })

  const resetShown = (): void => {
    setShown(fields.map(() => showAll))
    setShowAll(!showAll)
  }

  const toggleShownState = (newShowStates: boolean[]): void => {
    if (newShowStates.filter((shownState) => shownState === showAll).length > Math.floor(fields.length / 2)) {
      setShowAll(!showAll)
    }
  }

  useEffect(() => {
    resetShown()
  }, [])

  return (
    <FlatList
      data={fields}
      keyExtractor={({ name }, index) => name || index.toString()}
      renderItem={({ item: attr, index }) =>
        field ? (
          field(attr, index, fields)
        ) : (
          <RecordField
            field={attr}
            hideFieldValue={hideFieldValues}
            onToggleViewPressed={() => {
              const newShowState = [...shown]
              newShowState[index] = !shown[index]
              setShown(newShowState)
              toggleShownState(newShowState)
            }}
            shown={hideFieldValues ? !!shown[index] : true}
            hideBottomBorder={index === fields.length - 1}
          />
        )
      }
      ListHeaderComponent={
        header ? (
          <RecordHeader>
            {header()}
            {hideFieldValues ? (
              <View style={styles.linkContainer}>
                <TouchableOpacity
                  style={styles.link}
                  activeOpacity={1}
                  onPress={() => resetShown()}
                  testID={testIdWithKey('HideAll')}
                  accessible={true}
                  accessibilityLabel={showAll ? t('Record.ShowAll') : t('Record.HideAll')}
                >
                  <Text style={ListItems.recordLink}>{showAll ? t('Record.ShowAll') : t('Record.HideAll')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </RecordHeader>
        ) : null
      }
      ListFooterComponent={footer ? <RecordFooter>{footer()}</RecordFooter> : null}
    />
  )
}

export default Record
