import { Image, View, ViewStyle } from 'react-native'
import { toImageSource } from '../../utils/credential'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../../components/texts/ThemedText'

interface CredentialCardLogo {
  noLogoText: string
  containerStyle: ViewStyle
  logoHeight: number
  primaryBackgroundColor: string
  secondaryBackgroundColor?: string
  elevated?: boolean
  logo?: string
  isBranding11?: boolean
}

const CredentialCardGenLogo: React.FC<CredentialCardLogo> = ({
  noLogoText,
  containerStyle,
  logoHeight,
  secondaryBackgroundColor,
  primaryBackgroundColor,
  elevated,
  logo,
  isBranding11,
}: CredentialCardLogo) => {
  const { TextTheme } = useTheme()
  const textColor =
    secondaryBackgroundColor && secondaryBackgroundColor !== '' ? secondaryBackgroundColor : primaryBackgroundColor

  return (
    <View style={[containerStyle, { elevation: elevated ? 5 : 0 }]}>
      {logo ? (
        <Image
          source={toImageSource(logo)}
          style={{
            resizeMode: 'cover',
            width: logoHeight,
            height: logoHeight,
            borderRadius: 8,
          }}
          testID={testIdWithKey('Logo')}
        />
      ) : (
        <ThemedText
          variant="bold"
          style={[
            TextTheme.bold,
            {
              fontSize: 0.5 * logoHeight,
              alignSelf: 'center',
              color: isBranding11 ? textColor : '#000',
            },
          ]}
          testID={testIdWithKey('NoLogoText')}
        >
          {noLogoText.charAt(0).toUpperCase()}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCardGenLogo
