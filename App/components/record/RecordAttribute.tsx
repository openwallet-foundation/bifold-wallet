import startCase from 'lodash.startcase'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { ColorPallet, TextTheme } from '../../theme'
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  border: {
    borderBottomColor: ColorPallet.brand.primaryBackground,
    borderBottomWidth: 2,
    paddingTop: 12,
  },
  link: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
    color: ColorPallet.brand.link,
  },
  text: {
    ...TextTheme.normal,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  valueText: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
})

const RecordAttribute: React.FC<RecordAttributeProps> = ({
  attribute,
  hideAttributeValue = false,
  shown = hideAttributeValue ? false : true,
  onToggleViewPressed = () => undefined,
  attributeLabel = null,
  attributeValue = null,
}) => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      {attributeLabel ? (
        attributeLabel(attribute)
      ) : (
        <Text style={TextTheme.label} testID={testIdWithKey('AttributeName')}>
          {startCase(attribute.name)}
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
                activeOpacity={1}
                onPress={onToggleViewPressed}
                style={styles.link}
                testID={testIdWithKey('ShowHide')}
                accessible={true}
                accessibilityLabel={shown ? t('Record.Hide') : t('Record.Show')}
              >
                <Text style={[TextTheme.normal, { color: ColorPallet.brand.link }]}>
                  {shown ? t('Record.Hide') : t('Record.Show')}
                </Text>
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
