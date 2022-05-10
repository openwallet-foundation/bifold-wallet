import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Field } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'

interface RecordProps {
  header: () => React.ReactElement | null
  footer: () => React.ReactElement | null
  fields?: Array<Field>
  hideFieldValues?: boolean
  field?: (field: Field) => React.ReactElement | null
}

const Record: React.FC<RecordProps> = ({ header, footer, fields = [], hideFieldValues = false, field = null }) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    link: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
      color: ColorPallet.brand.link,
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
      ListHeaderComponent={
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
                <Text style={[TextTheme.normal, { color: ColorPallet.brand.link }]}>{t('Record.HideAll')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </RecordHeader>
      }
      ListFooterComponent={<RecordFooter>{footer()}</RecordFooter>}
      data={fields}
      keyExtractor={({ name }, index) => name || index.toString()}
      renderItem={({ item: attr, index }) =>
        field ? (
          field(attr)
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
          />
        )
      }
    />
  )
}

export default Record
