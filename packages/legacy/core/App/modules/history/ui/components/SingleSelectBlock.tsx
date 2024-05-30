import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TextTheme } from '../../../../theme'
import { HistoryBlockSelection } from '../../types'

const styles = StyleSheet.create({
  flexView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 48,
  },
  languageText: {
    marginLeft: 8,
  },
})

interface Props {
  selection: HistoryBlockSelection[] | undefined
  onSelect: (selected: HistoryBlockSelection) => void
  initialSelect?: HistoryBlockSelection
  color?: string
}

const SingleSelectBlock: React.FC<Props> = ({ selection, onSelect, initialSelect, color = TextTheme.normal.color }) => {
  const { t } = useTranslation()

  const [selected, setSelected] = useState<HistoryBlockSelection>()

  const handleSelect = (selected: HistoryBlockSelection) => {
    setSelected(selected)
    onSelect(selected)
  }

  useEffect(() => {
    if (initialSelect) {
      setSelected(initialSelect)
    }
  }, [initialSelect])

  return (
    <>
      {selection?.map((item) => (
        <TouchableOpacity
          accessible={true}
          accessibilityLabel={
            (item.id === selected?.id ? t('SelectionAxs.RadioChecked') : t('SelectionAxs.RadioUnchecked')) + item.value
          }
          accessibilityRole="radio"
          accessibilityState={{ selected: item.id === selected?.id }}
          key={item.id}
          style={styles.flexView}
          onPress={() => handleSelect(item)}
        >
          <Icon
            name={item.id === selected?.id ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={36}
            color={color}
          />
          <Text style={[styles.languageText, TextTheme.normal]}>{item.value}</Text>
        </TouchableOpacity>
      ))}
    </>
  )
}

export default SingleSelectBlock
