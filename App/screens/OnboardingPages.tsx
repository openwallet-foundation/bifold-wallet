import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import CredentialList from '../assets/img/credential-list.svg'
import ScanShare from '../assets/img/scan-share.svg'
import SecureImage from '../assets/img/secure-image.svg'
import { Colors } from '../theme'

import { OnboardingStyleSheet } from './Onboarding'

import { Button } from 'components'
import { ButtonType } from 'components/buttons/Button'
import { GenericFn } from 'types/fn'

const imageDisplayOptions = {
  fill: Colors.text,
  height: 180,
  width: 180,
}

export const carousel: OnboardingStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  carouselContainer: {
    flexDirection: 'column',
    backgroundColor: Colors.background,
  },
  pagerContainer: {
    flexShrink: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerDot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.primary,
  },
  pagerPosition: {
    position: 'relative',
    top: 0,
  },
  pagerNavigationButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
})

const defaultStyle = StyleSheet.create({
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bodyText: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: 'normal',
    color: Colors.text,
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

const customPages = (onTutorialCompleted: GenericFn) => {
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
          title={'Get Started!'}
          accessibilityLabel={'Get Started'}
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

export const pages = (onTutorialCompleted: GenericFn): Array<Element> => {
  return [...guides.map((g) => createPageWith(g.image, g.title, g.body)), customPages(onTutorialCompleted)]
}
