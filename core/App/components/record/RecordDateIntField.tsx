import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { dateIntFormat, hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { Attribute } from '../../types/record'
import { formatTime } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

interface RecordBinaryFieldProps {
  field: Attribute
  shown?: boolean
  style?: Record<string, unknown>
}

const RecordDateIntField: React.FC<RecordBinaryFieldProps> = ({ field, shown, style }) => {
  const { t } = useTranslation()

  const { ListItems } = useTheme()
  const [date, setDate] = useState<string | undefined>()

  useEffect(() => {
    const dateint = field.value as string
    if (dateint.length === dateIntFormat.length) {
      const year = dateint.substring(0, 4)
      const month = dateint.substring(4, 6)
      const day = dateint.substring(6, 8)
      //NOTE: JavaScript counts months from 0 to 11: January = 0, December = 11.
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      if (!isNaN(date.getDate())) {
        setDate(formatTime(date))
        return
      }
    }
    setDate(t('Record.InvalidDate') + dateint)
  }, [field])

  const styles = StyleSheet.create({
    text: {
      ...ListItems.recordAttributeText,
    },
    image: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
    },
  })

  return (
    <Text style={style || styles.text} testID={testIdWithKey('AttributeValue')}>
      {shown ? date : hiddenFieldValue}
    </Text>
  )
}

export default RecordDateIntField
