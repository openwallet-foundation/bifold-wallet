import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import Text from '../texts/Text'

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
  const { Inputs } = useTheme()
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      padding: 20,
    },
    row: {
      ...Inputs.singleSelect,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
  })
  const handleSelect = (selected: BlockSelection) => {
    setSelected(selected)
    onSelect(selected)
  }

  return (
    <View style={styles.container}>
      {selection.map((item) => (
        <TouchableOpacity key={item.id} style={styles.row} onPress={() => handleSelect(item)}>
          <Text style={Inputs.singleSelectText}>{item.value}</Text>
          {item.id === selected.id ? <Icon name={'check'} size={25} color={Inputs.singleSelectIcon.color} /> : null}
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default SingleSelectBlock
