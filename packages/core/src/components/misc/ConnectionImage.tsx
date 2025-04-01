import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
import { useConnectionImageUrl } from '../../utils/helpers'

interface ConnectionImageProps {
  connectionId?: string
  imageUri?: string
  marginTop?: number
}

const ConnectionImage: React.FC<ConnectionImageProps> = ({ connectionId, imageUri, marginTop }) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    connectionImageContainer: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      width: 90,
      height: 90,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 45,
      marginTop: marginTop ?? 15,
      borderColor: ColorPallet.grayscale.lightGrey,
      borderWidth: 3,
      alignSelf: 'center',
    },
    connectionImage: {
      width: 55,
      height: 55,
    },
  })

  const anonCredsImageUri = useConnectionImageUrl(connectionId ?? '')
  const connectionImage = imageUri ? imageUri : anonCredsImageUri

  return connectionImage ? (
    <View style={styles.connectionImageContainer}>
      <Image style={styles.connectionImage} source={toImageSource(connectionImage)} />
    </View>
  ) : null
}

export default ConnectionImage
