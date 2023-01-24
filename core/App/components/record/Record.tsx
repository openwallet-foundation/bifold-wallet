import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Field } from '../../types/record'
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
    setShown(fields.map(() => false))
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
                  accessibilityLabel={t('Record.HideAll')}
                >
                  <Text style={ListItems.recordLink}>{t('Record.HideAll')}</Text>
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
