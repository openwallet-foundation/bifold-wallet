import { Text } from 'components'
import { mainColor, shadow } from './../../globalStyles'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export interface BlockSelection {
  value: string
  id: string
}

interface Props {
  selection: BlockSelection[]
  onSelect: (selected: BlockSelection) => void
  initialSelect?: BlockSelection
}

const SingleSelectBlock: React.FC<Props> = ({ selection, onSelect, initialSelect }) => {
  const [selected, setSelected] = useState(initialSelect ?? selection[0])

  const handleSelect = (selected: BlockSelection) => {
    setSelected(selected)
    onSelect(selected)
  }

  return (
    <>
      {selection.map((item) => (
        <TouchableOpacity key={item.id} style={styles.row} onPress={() => handleSelect(item)}>
          <Text>{item.value}</Text>
          {item.id === selected.id ? <Icon name={'check'} size={25} color={mainColor} /> : null}
        </TouchableOpacity>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    width: '90%',
    borderRadius: 8,
    backgroundColor: shadow,
    marginTop: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

export default SingleSelectBlock
