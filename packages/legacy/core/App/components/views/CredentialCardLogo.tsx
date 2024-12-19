import { Image, StyleSheet, Text, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'

type Props = {
  overlay: CredentialOverlay<BrandingOverlay>
}

const logoHeight = 80
const paddingHorizontal = 24

const CredentialCardLogo: React.FC<Props> = ({ overlay }: Props) => {
  const { TextTheme } = useTheme()

  const styles = StyleSheet.create({
    logoContainer: {
      top: -0.5 * logoHeight,
      left: paddingHorizontal,
      marginBottom: -1 * logoHeight,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: 0.3,
    },
  })

  return (
    <View style={styles.logoContainer}>
      {overlay.brandingOverlay?.logo ? (
        <Image
          source={toImageSource(overlay.brandingOverlay?.logo)}
          style={{
            resizeMode: 'cover',
            width: logoHeight,
            height: logoHeight,
            borderRadius: 8,
          }}
        />
      ) : (
        <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
          {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

export default CredentialCardLogo
