import React from 'react'
import { Linking, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { Colors, Buttons } from '../Theme'
import CredentialList from '../assets/img/credential-list.svg'
import Credential from '../assets/img/credential.svg'
import ExternalLink from '../assets/img/external-link.svg'
import Info from '../assets/img/info.svg'
import MobilePhone from '../assets/img/mobile-phone.svg'
import ScanShare from '../assets/img/scan-share.svg'
import SecureCredential from '../assets/img/secure-credentials.svg'
import SecureImage from '../assets/img/secure-image.svg'

import { IOnboardingStyleSheet } from './Onboarding'

const imageDisplayOptions = {
  fill: Colors.textColor,
  height: 180,
  width: 180,
}

const xOptions = {
  fill: Colors.textColor,
  height: 30,
  width: 30,
}

const yOptions = {
  fill: Colors.textColor,
  height: 12,
  width: 12,
}

export const carousel: IOnboardingStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  carouselContainer: {
    flexDirection: 'column',
    backgroundColor: Colors.backgroundColor,
  },
  pagerContainer: {
    flexShrink: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerDot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.mainColor,
  },
  pagerPosition: {
    position: 'relative',
    top: 0,
  },
  pagerNavigationButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mainColor,
  },
})

const defaultStyle = StyleSheet.create({
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  bodyText: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: 'normal',
    color: Colors.textColor,
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

const xxDOne = async () => {
  let x = 1
  x = x + 1
  // console.log('Done')
}

const Intro = (
  <>
    <Text style={[defaultStyle.headerText, { marginLeft: 20, marginRight: 20 }]}>Welcome</Text>
    <Text style={[defaultStyle.bodyText, { marginLeft: 20, marginTop: 25, marginRight: 20 }]}>
      BC Wallet is a digital wallet that lets you store information about yourself and use it to share in-person and
      online easily and securely.
    </Text>

    <View style={[defaultStyle.point, { marginTop: 30 }]}>
      <Credential {...xOptions} style={defaultStyle.icon} />
      <Text style={[defaultStyle.bodyText]}>Add digital cards and documents to your BC Wallet.</Text>
    </View>

    <View style={[defaultStyle.point]}>
      <SecureCredential {...xOptions} style={defaultStyle.icon} />
      <Text style={[defaultStyle.bodyText]}>Need to show ID? Share only what you need to.</Text>
    </View>

    <View style={[defaultStyle.point]}>
      <MobilePhone {...xOptions} style={defaultStyle.icon} />
      <Text style={[defaultStyle.bodyText]}>Retain full control over your personal information.</Text>
    </View>

    <View style={[defaultStyle.point]}>
      <Info {...xOptions} style={defaultStyle.icon} />
      <TouchableOpacity onPress={() => Linking.openURL('https://example.com/')}>
        <Text style={[defaultStyle.bodyText, { color: 'blue', textDecorationLine: 'underline' }]}>
          Learn how the BC Wallet works.
        </Text>
      </TouchableOpacity>
      <ExternalLink {...yOptions} style={[defaultStyle.icon, { marginLeft: 7 }]} />
    </View>
  </>
)

const Final = (
  <>
    <View style={{ alignItems: 'center' }}>
      <SecureImage {...imageDisplayOptions} />
    </View>
    <View style={{ marginLeft: 20, marginRight: 20, marginTop: 30 }}>
      <Text style={[defaultStyle.headerText, { fontSize: 18 }]}>Take control of your information</Text>
      <Text style={[defaultStyle.bodyText, { marginTop: 20 }]}>
        You have full control of what you share and when. Your information is never seen by anyone without your
        permission, not even by the B.C. Government.
      </Text>
    </View>
    <View style={{ marginTop: 'auto', marginBottom: 20 }}>
      <TouchableHighlight
        testID={'dismissButton'}
        accessible={true}
        accessibilityLabel={'xxx'}
        style={[Buttons.primary, { marginLeft: 20, marginRight: 20 }]}
        underlayColor={Colors.activeMain}
        onPress={xxDOne}
      >
        <Text style={Buttons.primaryText}>Get Started!</Text>
      </TouchableHighlight>
    </View>
  </>
)
const guides: Array<{ image: React.FC<SvgProps>; title: string; body: string }> = [
  {
    image: CredentialList,
    title: 'Store and secure credentials',
    body: 'Your credentials are your digital cards and documents such as a drivers license. They are stored exclusively and securely on this device using advance blockchain technology. You can manage what credentials are stored.',
  },
  {
    image: ScanShare,
    title: 'Share only what is necessary',
    body: "Share only what is needed to access a service or a product, online or in-person. For example, you won't need to show your full drivers license when asked to prove if you're of legal age. You can choose to only share proof that you are and all else stays private.",
  },
]

const createPageWith = (image: React.FC<SvgProps>, title: string, body: string) => {
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

export const pages: Array<Element> = [Intro, ...guides.map((g) => createPageWith(g.image, g.title, g.body)), Final]
