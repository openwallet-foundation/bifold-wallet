import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { Attribute } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

import RecordAttribute from './RecordAttribute'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'

interface RecordProps {
  header: () => React.ReactElement | null
  footer: () => React.ReactElement | null
  attributes?: Array<Attribute>
  hideAttributeValues?: boolean
  attribute?: (attribute: Attribute) => React.ReactElement | null
}

const Record: React.FC<RecordProps> = ({
  header,
  footer,
  attributes = [],
  hideAttributeValues = false,
  attribute = null,
}) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])
  const { ListItems, TextTheme } = useThemeContext()
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
    },
  })
  const resetShown = (): void => {
    setShown(attributes.map(() => false))
  }

  useEffect(() => {
    resetShown()
  }, [])

  return (
    <FlatList
      ListHeaderComponent={
        <RecordHeader>
          {header()}
          {hideAttributeValues ? (
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
      }
      ListFooterComponent={<RecordFooter>{footer()}</RecordFooter>}
      data={attributes}
      keyExtractor={({ name }, index) => name || index.toString()}
      renderItem={({ item: attr, index }) =>
        attribute ? (
          attribute(attr)
        ) : (
          <RecordAttribute
            attribute={attr}
            hideAttributeValue={hideAttributeValues}
            onToggleViewPressed={() => {
              const newShowState = [...shown]
              newShowState[index] = !shown[index]
              setShown(newShowState)
            }}
            shown={hideAttributeValues ? !!shown[index] : true}
          />
        )
      }
    />
  )
}

export default Record
