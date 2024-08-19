import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { W3cCredentialDisplay } from '../types'
import { useTranslation } from 'react-i18next'
import { GenericFn } from '../../../types/fn'
import { Image, ImageBackground, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native'
import { testIdWithKey } from '../../../utils/testable'
import { credentialTextColor, toImageSource } from '../../../utils/credential'
import { useTheme } from '../../../contexts/theme'
import { formatTime } from '../../../utils/helpers'

interface CredentialCard10Props {
    credentialDisplay: W3cCredentialDisplay
    onPress?: GenericFn
    style?: ViewStyle
}

const paddingVertical = 10
const paddingHorizontal = 10
const transparent = 'rgba(0,0,0,0)'
const borderRadius = 15
const borderPadding = 8

const OpenIDCredentialCard: React.FC<CredentialCard10Props> = ({ credentialDisplay, style = {}, onPress = undefined }) => {
    
    const { t } = useTranslation()
    const { ColorPallet, TextTheme } = useTheme()
    const {display} = credentialDisplay

    const { width } = useWindowDimensions()
    const cardHeight = width / 2 // a card height is half of the screen width
    const cardHeaderHeight = cardHeight / 4 // a card has a total of 4 rows, and the header occupy 1 row

    const styles = StyleSheet.create({
        container: {
          backgroundColor: display.backgroundColor ? display.backgroundColor : transparent,
          height: cardHeight,
          borderRadius: borderRadius,
        },
        outerHeaderContainer: {
          flexDirection: 'column',
          backgroundColor: transparent,
          height: cardHeaderHeight + borderPadding,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        },
        innerHeaderContainer: {
          flexDirection: 'row',
          height: cardHeaderHeight,
          marginLeft: borderPadding,
          marginRight: borderPadding,
          marginTop: borderPadding,
          marginBottom: borderPadding,
          backgroundColor: transparent,
        },
        bodyContainer: {
          flexGrow: 1,
        },
        footerContainer: {
          flexDirection: 'row',
          backgroundColor: transparent,
          paddingHorizontal,
          paddingVertical,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
        },
        revokedFooter: {
          backgroundColor: ColorPallet.notification.error,
          flexGrow: 1,
          marginHorizontal: -1 * paddingHorizontal,
          marginVertical: -1 * paddingVertical,
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
        },
        flexGrow: {
          flexGrow: 1,
        },
        watermark: {
          opacity: 0.16,
          fontSize: 22,
          transform: [{ rotate: '-30deg' }],
        },
    })
    
   
    const CredentialCardHeader: React.FC = () => {
      return (
        <View style={[styles.outerHeaderContainer]}>
          <View testID={testIdWithKey('CredentialCardHeader')} style={[styles.innerHeaderContainer]}>
            {display.issuer.logo && (
              <Image
                source={toImageSource(display.issuer.logo)}
                style={{
                  flex: 4,
                  resizeMode: 'contain',
                  maxHeight: styles.outerHeaderContainer.height - borderPadding,
                }}
              />
            )}
            <View>
            <View>
              <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    TextTheme.label,
                    {
                      color:
                        display.textColor ??
                        credentialTextColor(
                          ColorPallet,
                          display.backgroundColor
                        ),
                      textAlignVertical: 'center',
                    },
                  ]}
                  testID={testIdWithKey('CredentialIssuer')}
                  maxFontSizeMultiplier={1}
                >
                  {display.issuer.name}
              </Text>
            </View>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  TextTheme.label,
                  {
                    color:
                      display.textColor ??
                      credentialTextColor(
                        ColorPallet,
                        display.backgroundColor
                      ),
                    textAlign: 'right',
                    textAlignVertical: 'center',
                  },
                ]}
                testID={testIdWithKey('CredentialName')}
                maxFontSizeMultiplier={1}
              >
                {display.description}
              </Text>
            </View>
            </View>
          </View>
        </View>
      )
  }
    
  const CredentialCardBody: React.FC = () => {
    return <View style={styles.bodyContainer} testID={testIdWithKey('CredentialCardBody')}></View>
  }
    
  const CredentialCardFooter: React.FC<{ revoked: boolean }> = ({ revoked = false }) => {
    return (
      <View testID={testIdWithKey('CredentialCardFooter')} style={styles.footerContainer}>
        {revoked ? (
          <View style={styles.revokedFooter}>
            <Text
              style={[TextTheme.label, { color: ColorPallet.semantic.error }]}
              testID={testIdWithKey('CredentialRevoked')}
            >
              {t('CredentialDetails.Revoked')}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              TextTheme.caption,
              {
                color:
                  display.textColor ??
                  credentialTextColor(
                    ColorPallet,
                    display.backgroundColor
                  ),
              },
            ]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {formatTime(new Date(), { shortMonth: true })}
          </Text>
        )}
      </View>
    )
  }
  const CredentialCard: React.FC<{ revoked?: boolean }> = ({ revoked = false }) => {
    return (
      <>
        <CredentialCardHeader />
        <CredentialCardBody />
        <CredentialCardFooter revoked={revoked} />
      </>
    )
  }
    
  return (
        <TouchableOpacity
          accessible={true}
          accessibilityLabel={`${
            display.issuer.name ? `${t('Credentials.IssuedBy')} ${display.issuer.name}` : ''
          }, ${t('Credentials.Credential')}.`}
          disabled={typeof onPress === 'undefined' ? true : false}
          onPress={onPress}
          style={[styles.container, style]}
          testID={testIdWithKey('ShowCredentialDetails')}
        >
          <View style={[styles.flexGrow, { overflow: 'hidden' }]} testID={testIdWithKey('CredentialCard')}>
            {display.backgroundImage ? (
              <ImageBackground
                source={toImageSource(display.backgroundImage)}
                style={styles.flexGrow}
                imageStyle={{ borderRadius }}
              >
                <CredentialCard revoked={false} />
              </ImageBackground>
            ) : (
                <CredentialCard revoked={false} />
            )}
          </View>
        </TouchableOpacity>
    )
}

export default OpenIDCredentialCard