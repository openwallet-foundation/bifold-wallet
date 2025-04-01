import { Field } from '@hyperledger/aries-oca/build/legacy'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'
import { ThemedText } from '../texts/ThemedText'

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

  const hideAll = useCallback((): void => {
    setShown(fields.map(() => false))
  }, [fields])

  useEffect(() => {
    hideAll()
  }, [hideAll])

  return (
    <FlatList
      data={fields}
      keyExtractor={({ name }, index) => name || index.toString()}
      showsVerticalScrollIndicator={false}
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
                  onPress={hideAll}
                  testID={testIdWithKey('HideAll')}
                  accessible={true}
                  accessibilityLabel={t('Record.HideAll')}
                  accessibilityRole="button"
                >
                  <ThemedText style={ListItems.recordLink}>{t('Record.HideAll')}</ThemedText>
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
