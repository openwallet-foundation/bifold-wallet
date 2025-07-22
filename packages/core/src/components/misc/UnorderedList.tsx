import React from 'react'
import { View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

type UnorderedListProps = {
  unorderedListItems: string[]
}

const UnorderedList: React.FC<UnorderedListProps> = ({ unorderedListItems }) => {
  const { ColorPalette } = useTheme()

  return (
    <>
      {unorderedListItems.map((item: string, i: number) => {
        return (
          <View key={i} style={{ display: 'flex', flexDirection: 'row', marginBottom: 5 }}>
            <ThemedText style={{ color: ColorPalette.brand.unorderedList, paddingLeft: 5 }}>{`\u2022`}</ThemedText>
            <ThemedText style={{ color: ColorPalette.brand.unorderedList, paddingLeft: 5, flex: 1 }}>{item}</ThemedText>
          </View>
        )
      })}
    </>
  )
}

export default UnorderedList
