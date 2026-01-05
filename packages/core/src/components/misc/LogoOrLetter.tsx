import React from 'react'
import { Image, View, ViewStyle, TextStyle, ImageStyle } from 'react-native'
import { ThemedText } from '../texts/ThemedText'
import { testIdWithKey } from '../../utils/testable'
import { toImageSource } from '../../utils/credential'

type Props = {
  containerStyle: ViewStyle | ViewStyle[]
  logo?: string
  logoHeight: number
  elevated?: boolean

  letter: string
  letterVariant: 'bold' | 'title'
  letterStyle?: TextStyle | TextStyle[]
  letterColor?: string

  imageBorderRadius?: number
  imageStyle?: ImageStyle | ImageStyle[]

  showTestIds?: boolean
}

const LogoOrLetter: React.FC<Props> = ({
  containerStyle,
  logo,
  logoHeight,
  elevated,
  letter,
  letterVariant,
  letterStyle,
  letterColor = '#000',
  imageBorderRadius = 8,
  imageStyle,
  showTestIds = true,
}) => {
  const normalizedLetter = (letter?.charAt(0) ?? '').toUpperCase()

  return (
    <View style={[containerStyle, { elevation: elevated ? 5 : 0 }]}>
      {logo ? (
        <Image
          source={toImageSource(logo)}
          style={[
            {
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: imageBorderRadius,
            },
            imageStyle,
          ]}
          testID={showTestIds ? testIdWithKey('Logo') : undefined}
        />
      ) : (
        <ThemedText
          variant={letterVariant}
          style={[
            {
              fontSize: 0.5 * logoHeight,
              alignSelf: 'center',
              color: letterColor,
            },
            letterStyle as any,
          ]}
          testID={showTestIds ? testIdWithKey('NoLogoText') : undefined}
          accessible={false}
        >
          {normalizedLetter}
        </ThemedText>
      )}
    </View>
  )
}

export default LogoOrLetter
