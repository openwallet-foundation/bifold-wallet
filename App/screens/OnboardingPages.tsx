import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import CredentialList from '../assets/img/credential-list.svg'
import ScanShare from '../assets/img/scan-share.svg'
import SecureImage from '../assets/img/secure-image.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { Theme } from '../theme'
import { GenericFn } from '../types/fn'
import { testIdWithKey } from '../utils/testable'

import { OnboardingStyleSheet } from './Onboarding'

export const createCarouselStyle = (theme: Theme): OnboardingStyleSheet => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.ColorPallet.brand.primaryBackground,
    },
    carouselContainer: {
      flexDirection: 'column',
      backgroundColor: theme.ColorPallet.brand.primaryBackground,
    },
    pagerContainer: {
      flexShrink: 2,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 35,
    },
    pagerDot: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.ColorPallet.brand.primary,
    },
    pagerDotActive: {
      color: theme.ColorPallet.brand.primary,
    },
    pagerDotInactive: {
      color: theme.ColorPallet.brand.secondary,
    },
    pagerPosition: {
      position: 'relative',
      top: 0,
    },
    pagerNavigationButton: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.primary,
    },
  })
}
export const createStyle = (theme: Theme) => {
  return StyleSheet.create({
    headerText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.ColorPallet.notification.infoText,
    },
    bodyText: {
      flexShrink: 1,
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPallet.notification.infoText,
    },
    point: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 20,
      marginTop: 10,
      marginRight: 20,
      marginBottom: 10,
    },
    icon: {
      marginRight: 10,
    },
  })
}
export function createImageDisplayOptions(theme: Theme) {
  return {
    fill: theme.ColorPallet.notification.infoText,
    height: 180,
    width: 180,
  }
}
const customPages = (onTutorialCompleted: GenericFn, theme: Theme) => {
  //const theme = useThemeContext()
  const defaultStyle = createStyle(theme)
  const imageDisplayOptions = createImageDisplayOptions(theme)
  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <SecureImage {...imageDisplayOptions} />
      </View>
      <View style={{ marginLeft: 20, marginRight: 20, marginTop: 30 }}>
        <Text style={[defaultStyle.headerText, { fontSize: 18 }]}>Ornare suspendisse sed nisi lacus</Text>
        <Text style={[defaultStyle.bodyText, { marginTop: 20 }]}>
          Enim facilisis gravida neque convallis a cras semper. Suscipit adipiscing bibendum est ultricies integer quis
          auctor elit sed.
        </Text>
      </View>
      <View style={{ marginTop: 'auto', marginBottom: 20, paddingHorizontal: 20 }}>
        <Button
          title={'Get Started'}
          accessibilityLabel={'Get Started'}
          testID={testIdWithKey('GetStarted')}
          onPress={onTutorialCompleted}
          buttonType={ButtonType.Primary}
        />
      </View>
    </>
  )
}

const guides: Array<{ image: React.FC<SvgProps>; title: string; body: string }> = [
  {
    image: CredentialList,
    title: 'Lorem ipsum dolor sit amet',
    body: 'Ipsum faucibus vitae aliquet nec ullamcorper sit amet risus.',
  },
  {
    image: ScanShare,
    title: 'Excepteur sint occaecat ',
    body: 'Mollis aliquam ut porttitor leo a diam sollicitudin tempor.',
  },
]

const createPageWith = (image: React.FC<SvgProps>, title: string, body: string, theme: Theme) => {
  //const theme = useThemeContext()
  const defaultStyle = createStyle(theme)
  const imageDisplayOptions = createImageDisplayOptions(theme)
  return (
    <>
      <View style={{ alignItems: 'center' }}>{image(imageDisplayOptions)}</View>
      <View style={{ marginLeft: 20, marginRight: 20, marginTop: 30 }}>
        <Text style={[defaultStyle.headerText, { fontSize: 18 }]}>{title}</Text>
        <Text style={[defaultStyle.bodyText, { marginTop: 20 }]}>{body}</Text>
      </View>
    </>
  )
}

export const pages = (onTutorialCompleted: GenericFn, theme: Theme): Array<Element> => {
  return [
    ...guides.map((g) => createPageWith(g.image, g.title, g.body, theme)),
    customPages(onTutorialCompleted, theme),
  ]
}
