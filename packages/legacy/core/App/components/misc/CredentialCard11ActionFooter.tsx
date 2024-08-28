import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'

interface CredentialActionFooterProps {
  onPress: GenericFn
  text: string
  testID: string
}

const CredentialActionFooter = ({ onPress, text, testID }: CredentialActionFooterProps) => {
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    seperator: {
      width: '100%',
      height: 2,
      marginVertical: 10,
      backgroundColor: ColorPallet.grayscale.lightGrey,
    },
    touchable: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    credActionText: {
      fontSize: 20,
      fontWeight: TextTheme.bold.fontWeight,
      color: ColorPallet.brand.link,
    },
  })

  return (
    <View>
      <View style={styles.seperator}></View>
      <View>
        <TouchableOpacity onPress={onPress} testID={testIdWithKey(testID)} style={styles.touchable}>
          <Text style={styles.credActionText}>{text}</Text>
          <Icon
            style={[styles.credActionText, { fontSize: styles.credActionText.fontSize + 5 }]}
            name="chevron-right"
          ></Icon>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CredentialActionFooter
