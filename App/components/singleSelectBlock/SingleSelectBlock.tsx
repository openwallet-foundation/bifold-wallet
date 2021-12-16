import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors } from '../../Theme'

import { Text } from 'components'

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    width: '90%',
    borderRadius: 8,
    backgroundColor: Colors.shadow,
    marginTop: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
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
          {item.id === selected.id ? <Icon name={'check'} size={25} color={Colors.mainColor} /> : null}
        </TouchableOpacity>
      ))}
    </>
  )
}

export default SingleSelectBlock
