import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '../../../components/texts/Text'
import Title from '../../../components/texts/Title'
import { Prompt } from '../types/api'

const Actions: React.FC<{prompts: Prompt[]}> = ({prompts}) => {
  const styles = StyleSheet.create({
    instruction: {
      textAlign: 'left',
      fontSize: 20,
      fontFamily: 'Lato',
      fontWeight: '500',
      width: '100%',
    },

    instructionItem: {
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      marginVertical: '5%',
    },

    count: {
      fontSize: 22,
      fontFamily: 'Lato',
      fontWeight: '500',
    },
  })

  return (
    <>
      {prompts?.map((instruction, index) => (
        <View key={instruction.id} style={styles.instructionItem}>
          <Title style={styles.count}>{index + 1}.</Title>
          <Text style={styles.instruction}>{instruction.text}</Text>
        </View>
      ))}
    </>
  )
}

export default Actions
