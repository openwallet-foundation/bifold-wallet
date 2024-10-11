import React from 'react'
import { StyleSheet, View } from 'react-native'

import { prompts } from './prompts'

import Text from '../../components/texts/Text'
import Title from '../../components/texts/Title'

const Actions: React.FC = () => {
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
        <View key={index} style={styles.instructionItem}>
          <Title style={styles.count}>{index + 1}.</Title>
          <Text style={styles.instruction}>{instruction}</Text>
        </View>
      ))}
    </>
  )
}

export default Actions
