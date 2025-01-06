import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import CardWatermark from '../../components/misc/CardWatermark'
import { useTheme } from '../../contexts/theme'
import { credentialTextColor } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

type CredentialDetailPrimaryHeaderProps = {
  overlay: CredentialOverlay<BrandingOverlay>
}

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetailPrimaryHeader: React.FC<CredentialDetailPrimaryHeaderProps> = ({ overlay }: CredentialDetailPrimaryHeaderProps) => {
  const { TextTheme, ColorPallet } = useTheme()
  const { width, height } = useWindowDimensions()
  const styles = StyleSheet.create({
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
    },
  })

  return (
    <View
      testID={testIdWithKey('CredentialDetailsPrimaryHeader')}
      style={[styles.primaryHeaderContainer, { zIndex: -1 }]}
    >
      <View>
        {overlay.metaOverlay?.watermark && (
          <CardWatermark width={width} height={height} watermark={overlay.metaOverlay?.watermark} />
        )}
        <Text
          testID={testIdWithKey('CredentialIssuer')}
          style={[
            TextTheme.label,
            styles.textContainer,
            {
              paddingLeft: logoHeight + paddingVertical,
              paddingBottom: paddingVertical,
              lineHeight: 19,
              opacity: 0.8,
            },
          ]}
          numberOfLines={1}
        >
          {overlay.metaOverlay?.issuer}
        </Text>
        <Text
          testID={testIdWithKey('CredentialName')}
          style={[
            TextTheme.normal,
            styles.textContainer,
            {
              lineHeight: 24,
            },
          ]}
        >
          {overlay.metaOverlay?.name}
        </Text>
      </View>
    </View>
  )
}

export default CredentialDetailPrimaryHeader
