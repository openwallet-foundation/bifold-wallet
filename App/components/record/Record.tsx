import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { ColorPallet, TextTheme } from '../../theme'

import RecordAttribute from './RecordAttribute'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'

import { Attribute } from 'types/record'

interface RecordProps {
  header: () => React.ReactElement | null
  footer: () => React.ReactElement | null
  attributes?: Array<Attribute>
  hideAttributeValues?: boolean
  attribute?: (attribute: Attribute) => React.ReactElement | null
}

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

const Record: React.FC<RecordProps> = ({
  header,
  footer,
  attributes = [],
  hideAttributeValues = false,
  attribute = null,
}) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])

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
              <TouchableOpacity style={styles.link} activeOpacity={1} onPress={() => resetShown()}>
                <Text style={TextTheme.normal}>{t('CredentialDetails.HideAll')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </RecordHeader>
      }
      ListFooterComponent={<RecordFooter>{footer()}</RecordFooter>}
      data={attributes}
      keyExtractor={({ name }) => name}
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
