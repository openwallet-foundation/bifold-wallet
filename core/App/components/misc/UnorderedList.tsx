import React from 'react'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

type ListProps = {
  listItems: any
}

const UnorderedList: React.FC<ListProps> = ({ listItems }) => {
  const { ListItems, ColorPallet, TextTheme } = useTheme()

  return listItems.map((item: string, i: number) => {
    return (
      <View key={i} style={[{ display: 'flex', flexDirection: 'row', marginBottom: 5 }]}>
        <Text style={[TextTheme.normal, { paddingLeft: 5 }]}>{`\u2022`}</Text>
        <Text style={[TextTheme.normal, { paddingLeft: 5 }]}>{item}</Text>
      </View>
    )
  })
}

export default UnorderedList
