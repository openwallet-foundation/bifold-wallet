import startCase from 'lodash.startcase'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Attribute, Field } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

interface RecordFieldProps {
  field: Field
  hideFieldValue?: boolean
  shown?: boolean
  onToggleViewPressed?: () => void
  fieldLabel?: (field: Field) => React.ReactElement | null
  fieldValue?: (field: Field) => React.ReactElement | null
}

const RecordField: React.FC<RecordFieldProps> = ({
  field,
  hideFieldValue = false,
  shown = hideFieldValue ? false : true,
  onToggleViewPressed = () => undefined,
  fieldLabel = null,
  fieldValue = null,
}) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
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

  return (
    <View style={styles.container}>
      {fieldLabel ? (
        fieldLabel(field)
      ) : (
        <Text style={TextTheme.label} testID={testIdWithKey('AttributeName')}>
          {startCase(field.name || '')}
        </Text>
      )}
      <View style={styles.valueContainer}>
        {fieldValue ? (
          fieldValue(field)
        ) : (
          <>
            <View style={styles.valueText}>
              <Text style={styles.text} testID={testIdWithKey('AttributeValue')}>
                {shown ? (field as Attribute).value : Array(10).fill('\u2022').join('')}
              </Text>
            </View>
            {hideFieldValue ? (
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={shown ? t('Record.Hide') : t('Record.Show')}
                testID={testIdWithKey('ShowHide')}
                activeOpacity={1}
                onPress={onToggleViewPressed}
                style={styles.link}
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

export default RecordField
