import React from 'react'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

type UnorderedListProps = {
  UnorderedListItems: string[]
}

const UnorderedList: React.FC<UnorderedListProps> = ({ UnorderedListItems }) => {
  const { TextTheme, ColorPallet } = useTheme()

  return (
    <View>
      {UnorderedListItems.map((item: string, i: number) => {
        return (
          <View key={i} style={[{ display: 'flex', flexDirection: 'row', marginBottom: 5 }]}>
            <Text
              style={[TextTheme.normal, { color: ColorPallet.brand.unorderedListModal, paddingLeft: 5 }]}
            >{`\u2022`}</Text>
            <Text style={[TextTheme.normal, { color: ColorPallet.brand.unorderedListModal, paddingLeft: 5 }]}>
              {item}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

export default UnorderedList
