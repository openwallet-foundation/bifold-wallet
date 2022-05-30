import startCase from 'lodash.startcase'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
  const { ListItems } = useTheme()
  const regexImageBase64 = new RegExp('^data:image/(jpeg|png);base64,')

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
    image: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
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

  const displayAttribute = (attribute: Attribute) => {
    if (typeof attribute.value === 'string' && regexImageBase64.test(attribute.value)) {
      return <Image testID={testIdWithKey('credentialImage')} style={styles.image} source={{ uri: attribute.value }} />
    } else {
      return attribute.value
    }
  }

  return (
    <View style={styles.container}>
      {fieldLabel ? (
        fieldLabel(field)
      ) : (
        <Text style={ListItems.recordAttributeLabel} testID={testIdWithKey('AttributeName')}>
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
                {shown ? displayAttribute(field as Attribute) : Array(10).fill('\u2022').join('')}
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

export default RecordField
