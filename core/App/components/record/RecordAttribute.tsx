import startCase from 'lodash.startcase'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Attribute } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

interface RecordAttributeProps {
  attribute: Attribute
  hideAttributeValue?: boolean
  shown?: boolean
  onToggleViewPressed?: () => void
  attributeLabel?: (attribute: Attribute) => React.ReactElement | null
  attributeValue?: (attribute: Attribute) => React.ReactElement | null
}

const RecordAttribute: React.FC<RecordAttributeProps> = ({
  attribute,
  hideAttributeValue = false,
  shown = hideAttributeValue ? false : true,
  onToggleViewPressed = () => undefined,
  attributeLabel = null,
  attributeValue = null,
}) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...ListItems.recordContainer,
      paddingHorizontal: 25,
      paddingTop: 16,
    },
    border: {
      ...ListItems.recordBorder,
      borderBottomWidth: 2,
      paddingTop: 12,
    },
    link: {
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    text: {
      ...ListItems.recordAttributeText,
    },
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
    },
    valueText: {
      ...ListItems.recordAttributeText,
      paddingVertical: 4,
    },
  })

  return (
    <View style={styles.container}>
      {attributeLabel ? (
        attributeLabel(attribute)
      ) : (
        <Text style={ListItems.recordAttributeLabel} testID={testIdWithKey('AttributeName')}>
          {startCase(attribute.name || '')}
        </Text>
      )}
      <View style={styles.valueContainer}>
        {attributeValue ? (
          attributeValue(attribute)
        ) : (
          <>
            <View style={styles.valueText}>
              <Text style={styles.text} testID={testIdWithKey('AttributeValue')}>
                {shown ? attribute.value : Array(10).fill('\u2022').join('')}
              </Text>
            </View>
            {hideAttributeValue ? (
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={shown ? t('Record.Hide') : t('Record.Show')}
                testID={testIdWithKey('ShowHide')}
                activeOpacity={1}
                onPress={onToggleViewPressed}
                style={styles.link}
              >
                <Text style={ListItems.recordLink}>{shown ? t('Record.Hide') : t('Record.Show')}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>
      <View style={styles.border}></View>
    </View>
  )
}

export default RecordAttribute
