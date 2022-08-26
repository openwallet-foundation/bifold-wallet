import { StyleSheet } from 'react-native'

interface FontAttributes {
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  fontSize: number
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
}

interface InputAttributes {
  padding?: number
  borderRadius?: number
  fontSize?: number
  backgroundColor?: string
  color?: string
  borderWidth?: number
  borderColor?: string
}

interface Inputs {
  label: FontAttributes
  textInput: InputAttributes
  inputSelected: InputAttributes
  singleSelect: InputAttributes
  singleSelectText: FontAttributes
  singleSelectIcon: InputAttributes
  checkBoxColor: InputAttributes
  checkBoxText: FontAttributes
}

interface TextTheme {
  headingOne: FontAttributes
  headingTwo: FontAttributes
  headingThree: FontAttributes
  headingFour: FontAttributes
  normal: FontAttributes
  label: FontAttributes
  labelTitle: FontAttributes
  labelSubtitle: FontAttributes
  labelText: FontAttributes
  caption: FontAttributes
  title: FontAttributes
}

interface BrandColors {
  primary: string
  primaryDisabled: string
  secondary: string
  secondaryDisabled: string
  highlight: string
  modalPrimaryBackground: string
  modalSecondaryBackground: string
  primaryBackground: string
  secondaryBackground: string
  link: string
}

interface SemanticColors {
  error: string
  success: string
  focus: string
}

interface NotificationColors {
  success: string
  successBorder: string
  successIcon: string
  successText: string
  info: string
  infoBorder: string
  infoIcon: string
  infoText: string
  warn: string
  warnBorder: string
  warnIcon: string
  warnText: string
  error: string
  errorBorder: string
  errorIcon: string
  errorText: string
}

interface GrayscaleColors {
  black: string
  darkGrey: string
  mediumGrey: string
  lightGrey: string
  veryLightGrey: string
  white: string
}

interface ColorPallet {
  brand: BrandColors
  semantic: SemanticColors
  notification: NotificationColors
  grayscale: GrayscaleColors
}

interface Assets {
  img: {
    logoPrimary: any
    logoSecondary: any
  }
}

export const borderRadius = 4
export const heavyOpacity = 0.7
export const lightOpacity = 0.35
export const zeroOpacity = 0.0
export const borderWidth = 2

const BrandColors: BrandColors = {
  primary: '#42803E',
  primaryDisabled: `rgba(53, 130, 63, ${lightOpacity})`,
  secondary: '#FFFFFFFF',
  secondaryDisabled: `rgba(53, 130, 63, ${heavyOpacity})`,
  highlight: '#FCBA19',
  primaryBackground: '#000000',
  secondaryBackground: '#313132',
  modalPrimaryBackground: '#000000',
  modalSecondaryBackground: '#313132',
  link: '#FFFFFF',
}

const SemanticColors: SemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399FF',
}

const NotificationColors: NotificationColors = {
  success: '#313132',
  successBorder: '#2E8540',
  successIcon: '#2E8540',
  successText: '#FFFFFF',
  info: '#313132',
  infoBorder: '#0099FF',
  infoIcon: '#0099FF',
  infoText: '#FFFFFF',
  warn: '#313132',
  warnBorder: '#FCBA19',
  warnIcon: '#FCBA19',
  warnText: '#FFFFFF',
  error: '#313132',
  errorBorder: '#D8292F',
  errorIcon: '#D8292F',
  errorText: '#FFFFFF',
}

const GrayscaleColors: GrayscaleColors = {
  black: '#000000',
  darkGrey: '#313132',
  mediumGrey: '#606060',
  lightGrey: '#D3D3D3',
  veryLightGrey: '#F2F2F2',
  white: '#FFFFFF',
}

export const ColorPallet: ColorPallet = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

export const TextTheme: TextTheme = {
  headingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  headingTwo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  headingThree: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  headingFour: {
    fontSize: 21,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  normal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.white,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  labelSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.white,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: ColorPallet.grayscale.white,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorPallet.notification.infoText,
  },
}

export const Inputs: Inputs = StyleSheet.create({
  label: {
    ...TextTheme.label,
  },
  textInput: {
    padding: 10,
    borderRadius,
    fontSize: 16,
    backgroundColor: ColorPallet.brand.primaryBackground,
    color: ColorPallet.notification.infoText,
    borderWidth: 2,
    borderColor: ColorPallet.brand.secondary,
  },
  inputSelected: {
    borderColor: ColorPallet.brand.primary,
  },
  singleSelect: {
    padding: 12,
    borderRadius: borderRadius * 2,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  singleSelectText: {
    ...TextTheme.normal,
  },
  singleSelectIcon: {
    color: ColorPallet.grayscale.white,
  },
  checkBoxColor: {
    color: ColorPallet.brand.primary,
  },
  checkBoxText: {
    ...TextTheme.normal,
  },
})

export const Buttons = StyleSheet.create({
  critical: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: '#42803E',
  },
  primary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primary,
  },
  primaryDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  primaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
    textAlign: 'center',
  },
  primaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
    textAlign: 'center',
  },
  secondary: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  secondaryDisabled: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.secondaryDisabled,
  },
  secondaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
    textAlign: 'center',
  },
  secondaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.secondaryDisabled,
    textAlign: 'center',
  },
})

export const ListItems = StyleSheet.create({
  credentialBackground: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  credentialTitle: {
    ...TextTheme.headingFour,
  },
  credentialDetails: {
    ...TextTheme.caption,
  },
  credentialDeleteBackground: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  credentialOfferBackground: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  credentialOfferTitle: {
    ...TextTheme.headingThree,
  },
  credentialOfferDetails: {
    ...TextTheme.normal,
  },
  revoked: {
    backgroundColor: ColorPallet.notification.error,
    borderColor: ColorPallet.notification.errorBorder,
  },
  contactBackground: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  credentialIconColor: {
    color: ColorPallet.notification.infoText,
  },
  contactTitle: {
    color: ColorPallet.grayscale.white,
  },
  contactDate: {
    color: ColorPallet.grayscale.white,
    marginTop: 10,
  },
  contactIconBackground: {
    backgroundColor: ColorPallet.brand.primary,
  },
  contactIcon: {
    color: ColorPallet.grayscale.white,
  },
  recordAttributeLabel: {
    ...TextTheme.normal,
  },
  recordContainer: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  recordBorder: {
    borderBottomColor: ColorPallet.brand.primaryBackground,
  },
  recordLink: {
    color: ColorPallet.brand.link,
  },
  recordAttributeText: {
    ...TextTheme.normal,
  },
  proofIcon: {
    ...TextTheme.headingOne,
  },
  proofError: {
    color: ColorPallet.semantic.error,
  },
  avatarText: {
    ...TextTheme.headingTwo,
    fontWeight: 'normal',
  },
  avatarCircle: {
    borderRadius: TextTheme.headingTwo.fontSize,
    borderColor: TextTheme.headingTwo.color,
    width: TextTheme.headingTwo.fontSize * 2,
    height: TextTheme.headingTwo.fontSize * 2,
  },
  emptyList: {
    ...TextTheme.normal,
  },
})

export const TabTheme = {
  tabBarStyle: {
    height: 60,
    backgroundColor: ColorPallet.brand.secondaryBackground,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    shadowColor: ColorPallet.grayscale.black,
    shadowOpacity: 0.1,
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  tabBarActiveTintColor: ColorPallet.brand.primary,
  tabBarInactiveTintColor: ColorPallet.notification.infoText,
  tabBarTextStyle: {
    ...TextTheme.label,
    fontWeight: 'normal',
    paddingBottom: 5,
  },
  tabBarButtonIconStyle: {
    color: ColorPallet.notification.infoText,
  },
  focusTabIconStyle: {
    height: 60,
    width: 60,
    backgroundColor: ColorPallet.brand.primary,
    top: -20,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusTabActiveTintColor: {
    backgroundColor: ColorPallet.brand.secondary,
  },
}

export const NavigationTheme = {
  dark: true,
  colors: {
    primary: ColorPallet.brand.primary,
    background: ColorPallet.brand.primaryBackground,
    card: ColorPallet.brand.primary,
    text: ColorPallet.grayscale.white,
    border: ColorPallet.grayscale.white,
    notification: ColorPallet.grayscale.white,
  },
}

export const HomeTheme = StyleSheet.create({
  welcomeHeader: {
    ...TextTheme.headingOne,
  },
  credentialMsg: {
    ...TextTheme.normal,
  },
  notificationsHeader: {
    ...TextTheme.headingThree,
  },
  noNewUpdatesText: {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
})

export const SettingsTheme = {
  groupHeader: {
    ...TextTheme.normal,
    marginBottom: 8,
  },
  groupBackground: ColorPallet.brand.secondaryBackground,
  iconColor: ColorPallet.grayscale.white,
  text: {
    ...TextTheme.caption,
    color: ColorPallet.grayscale.white,
  },
}

export const ChatTheme = {
  leftBubble: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    borderRadius: 20,
    padding: 4,
    marginLeft: -4,
  },
  rightBubble: {
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 20,
    padding: 4,
    marginRight: 4,
  },
  leftText: {
    color: ColorPallet.brand.secondary,
    fontSize: TextTheme.normal.fontSize,
  },
  rightText: {
    color: ColorPallet.brand.secondary,
    fontSize: TextTheme.normal.fontSize,
  },
  inputToolbar: {
    backgroundColor: ColorPallet.brand.secondary,
    shadowColor: ColorPallet.brand.primaryDisabled,
    borderRadius: 10,
  },
  inputText: {
    lineHeight: undefined,
    fontWeight: '500',
    fontSize: TextTheme.normal.fontSize,
  },
  placeholderText: ColorPallet.grayscale.lightGrey,
  sendContainer: {
    marginBottom: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  sendEnabled: ColorPallet.brand.primary,
  sendDisabled: ColorPallet.brand.primaryDisabled,
}

export const OnboardingTheme = {
  container: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  carouselContainer: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  pagerDot: {
    borderColor: ColorPallet.brand.primary,
  },
  pagerDotActive: {
    color: ColorPallet.brand.primary,
  },
  pagerDotInactive: {
    color: ColorPallet.brand.secondary,
  },
  pagerNavigationButton: {
    color: ColorPallet.brand.primary,
  },
  headerTintColor: ColorPallet.grayscale.white,
  headerText: {
    color: ColorPallet.notification.infoText,
    fontSize: 32,
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.notification.infoText,
  },
  imageDisplayOptions: {
    fill: ColorPallet.notification.infoText,
  },
}

const LoadingTheme = {
  backgroundColor: ColorPallet.brand.primaryBackground,
}

const PinInputTheme = {
  cell: {
    backgroundColor: ColorPallet.grayscale.darkGrey,
    borderColor: ColorPallet.grayscale.darkGrey,
  },
  focussedCell: {
    borderColor: ColorPallet.grayscale.lightGrey,
  },
  cellText: {
    color: ColorPallet.grayscale.white,
  },
  icon: {
    color: ColorPallet.grayscale.white,
  },
}

export const Assets = {
  img: {
    logoPrimary: {
      src: require('./assets/img/logo-large.png'),
      aspectRatio: 1,
      height: '33%',
      width: '33%',
      resizeMode: 'contain',
    },
    logoSecondary: {
      src: require('./assets/img/logo-large.png'),
      aspectRatio: 1,
      height: '33%',
      width: '33%',
      resizeMode: 'contain',
    },
  },
}

export interface Theme {
  ColorPallet: ColorPallet
  TextTheme: TextTheme
  Inputs: Inputs
  Buttons: any
  ListItems: any
  TabTheme: any
  NavigationTheme: any
  HomeTheme: any
  SettingsTheme: any
  ChatTheme: any
  OnboardingTheme: any
  LoadingTheme: any
  PinInputTheme: any
  heavyOpacity: any
  borderRadius: any
  borderWidth: typeof borderWidth
  Assets: Assets
}

export const theme: Theme = {
  ColorPallet,
  TextTheme,
  Inputs,
  Buttons,
  ListItems,
  TabTheme,
  NavigationTheme,
  HomeTheme,
  SettingsTheme,
  ChatTheme,
  OnboardingTheme,
  LoadingTheme,
  PinInputTheme,
  heavyOpacity,
  borderRadius,
  borderWidth,
  Assets,
}
