import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Attribute, Field } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

interface RecordBinaryFieldProps {
  field: Field
  shown?: boolean
}
const dateIntFormat = 'YYYYMMDD'

const RecordDateIntField: React.FC<RecordBinaryFieldProps> = ({ field, shown }) => {
  const { ListItems } = useTheme()
  const [date, setDate] = useState<string | undefined>()

  useEffect(() => {
    if (moment((field as Attribute).value as string, dateIntFormat).isValid()) {
      const dateObject = moment((field as Attribute).value as string, dateIntFormat)
      setDate(moment(dateObject).format(field.format))
    }
    setDate((field as Attribute).value as string)
  })

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
    <Text style={styles.text} testID={testIdWithKey('AttributeValue')}>
      {shown ? date : Array(10).fill('\u2022').join('')}
    </Text>
  )
}

export default RecordDateIntField
