import { StyleSheet, ViewStyle } from 'react-native'
import { SvgProps } from 'react-native-svg'

import Arrow from './assets/icons/large-arrow.svg'
import IconDelete from './assets/icons/trash.svg'
import IconEdit from './assets/icons/pencil.svg'
import IconCode from './assets/icons/code.svg'
import ActivityIndicator from './assets/img/activity-indicator-circle.svg'
import AppLockout from './assets/img/app-lockout.svg'
import Biometrics from './assets/img/biometrics.svg'
import ContactBook from './assets/img/contact-book.svg'
import CredentialDeclined from './assets/img/credential-declined.svg'
import DeleteNotification from './assets/img/delete-notification.svg'
import EmptyWallet from './assets/img/empty-wallet.svg'
import IconCredentialOfferDark from './assets/img/icon-credential-offer-dark.svg'
import IconCredentialOfferLight from './assets/img/icon-credential-offer-light.svg'
import IconInfoRecievedDark from './assets/img/icon-info-recieved-dark.svg'
import IconInfoRecievedLight from './assets/img/icon-info-recieved-light.svg'
import IconInfoSentDark from './assets/img/icon-info-sent-dark.svg'
import IconInfoSentLight from './assets/img/icon-info-sent-light.svg'
import IconProofRequestDark from './assets/img/icon-proof-request-dark.svg'
import IconProofRequestLight from './assets/img/icon-proof-request-light.svg'
import Logo from './assets/img/logo.svg'
import NoInfoShared from './assets/img/no_information_shared.svg'
import Preface from './assets/img/preface.svg'
import UpdateAvailable from './assets/img/update-available.svg'
import ProofRequestDeclined from './assets/img/proof-declined.svg'
import VerifierRequestDeclined from './assets/img/verifier-request-declined.svg'
import Wallet from './assets/img/wallet.svg'
import CheckInCircle from './assets/img/check-in-circle.svg'
import CredentialCard from './assets/img/credential-card.svg'
import WalletBack from './assets/img/wallet-back.svg'
import WalletFront from './assets/img/wallet-front.svg'
import CredentialInHand from './assets/img/credential-in-hand.svg'
import CredentialList from './assets/img/credential-list.svg'
import ScanShare from './assets/img/scan-share.svg'
import SecureCheck from './assets/img/secure-check.svg'
import SecureImage from './assets/img/secure-image.svg'
import InformationReceived from './assets/img/information-received.svg'
import PushNotificationImg from './assets/img/push-notifications.svg'
import ChatLoading from './assets/img/chat-loading.svg'
import HistoryCardAcceptedIcon from './assets/img/HistoryCardAcceptedIcon.svg'
import HistoryCardExpiredIcon from './assets/img/HistoryCardExpiredIcon.svg'
import HistoryCardRevokedIcon from './assets/img/HistoryCardRevokedIcon.svg'
import HistoryInformationSentIcon from './assets/img/HistoryInformationSentIcon.svg'
import HistoryPinUpdatedIcon from './assets/img/HistoryPinUpdatedIcon.svg'
import IconChevronRight from './assets/img/IconChevronRight.svg'
import HomeCenterImg from './assets/img/home-center-img.svg'
import IconWarning from './assets/img/exclamation-mark.svg'
import IconError from './assets/img/error-filled.svg'
import TabOneFocusedIcon from './assets/img/message-text-icon.svg'
import TabOneIcon from './assets/img/message-text-icon-outline.svg'
import TabTwoIcon from './assets/img/qrcode-scan-icon.svg'
import TabThreeFocusedIcon from './assets/img/wallet-icon.svg'
import TabThreeIcon from './assets/img/wallet-icon-outline.svg'
import React from 'react'

export interface ISVGAssets {
  activityIndicator: React.FC<SvgProps>
  appLockout: React.FC<SvgProps>
  biometrics: React.FC<SvgProps>
  contactBook: React.FC<SvgProps>
  credentialDeclined: React.FC<SvgProps>
  deleteNotification: React.FC<SvgProps>
  emptyWallet: React.FC<SvgProps>
  logo: React.FC<SvgProps>
  proofRequestDeclined: React.FC<SvgProps>
  arrow: React.FC<SvgProps>
  iconCredentialOfferDark: React.FC<SvgProps>
  iconCredentialOfferLight: React.FC<SvgProps>
  iconInfoRecievedDark: React.FC<SvgProps>
  iconInfoRecievedLight: React.FC<SvgProps>
  iconInfoSentDark: React.FC<SvgProps>
  iconInfoSentLight: React.FC<SvgProps>
  iconProofRequestDark: React.FC<SvgProps>
  iconProofRequestLight: React.FC<SvgProps>
  preface: React.FC<SvgProps>
  updateAvailable: React.FC<SvgProps>
  verifierRequestDeclined: React.FC<SvgProps>
  noInfoShared: React.FC<SvgProps>
  wallet: React.FC<SvgProps>
  checkInCircle: React.FC<SvgProps>
  credentialCard: React.FC<SvgProps>
  walletBack: React.FC<SvgProps>
  walletFront: React.FC<SvgProps>
  credentialInHand: React.FC<SvgProps>
  credentialList: React.FC<SvgProps>
  scanShare: React.FC<SvgProps>
  secureCheck: React.FC<SvgProps>
  secureImage: React.FC<SvgProps>
  informationReceived: React.FC<SvgProps>
  pushNotificationImg: React.FC<SvgProps>
  chatLoading: React.FC<SvgProps>
  historyCardAcceptedIcon: React.FC<SvgProps>
  historyCardDeclinedIcon: React.FC<SvgProps>
  historyCardExpiredIcon: React.FC<SvgProps>
  historyCardRemovedIcon: React.FC<SvgProps>
  historyCardRevokedIcon: React.FC<SvgProps>
  historyCardUpdatesIcon: React.FC<SvgProps>
  historyPinUpdatedIcon: React.FC<SvgProps>
  historyInformationSentIcon: React.FC<SvgProps>
  historyInformationNotSentIcon: React.FC<SvgProps>
  historyConnectionIcon: React.FC<SvgProps>
  historyConnectionRemovedIcon: React.FC<SvgProps>
  historyActivateBiometryIcon: React.FC<SvgProps>
  historyDeactivateBiometryIcon: React.FC<SvgProps>
  iconChevronRight: React.FC<SvgProps>
  homeCenterImg: React.FC<SvgProps>
  iconDelete: React.FC<SvgProps>
  iconEdit: React.FC<SvgProps>
  iconWarning: React.FC<SvgProps>
  iconError: React.FC<SvgProps>
  iconCode: React.FC<SvgProps>
  tabOneIcon: React.FC<SvgProps>
  tabOneFocusedIcon: React.FC<SvgProps>
  tabTwoIcon: React.FC<SvgProps>
  tabThreeIcon: React.FC<SvgProps>
  tabThreeFocusedIcon: React.FC<SvgProps>
}

export interface ISpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface IFontAttributes {
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  fontSize: number
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
  lineHeight?: number
}

export interface IInputAttributes {
  padding?: number
  borderRadius?: number
  fontSize?: number
  backgroundColor?: string
  color?: string
  borderWidth?: number
  borderColor?: string
}

export interface ISemanticColors {
  error: string
  success: string
  focus: string
}

export interface INotificationColors {
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
  popupOverlay: string
}

export interface IGrayscaleColors {
  black: string
  darkGrey: string
  mediumGrey: string
  lightGrey: string
  veryLightGrey: string
  white: string
}

export interface IErrorColors {
  error: string
  warning: string
}

export interface IColorPallet {
  brand: IBrandColors
  semantic: ISemanticColors
  notification: INotificationColors
  grayscale: IGrayscaleColors
}

export interface IAssets {
  svg: ISVGAssets
  img: {
    logoPrimary: any
    logoSecondary: any
  }
}

export const borderRadius = 4
export const heavyOpacity = 0.7
export const mediumOpacity = 0.5
export const lightOpacity = 0.35
export const zeroOpacity = 0.0
export const borderWidth = 2
export const maxFontSizeMultiplier = 2

const Spacing: ISpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}

const GrayscaleColors: IGrayscaleColors = {
  black: '#000000',
  darkGrey: '#313132',
  mediumGrey: '#606060',
  lightGrey: '#D3D3D3',
  veryLightGrey: '#F2F2F2',
  white: '#FFFFFF',
}

const InlineErrorMessageColors: IErrorColors = {
  error: '#ff0000',
  warning: '#ff9000',
}

const BrandColors = {
  primary: '#42803E',
  primaryDisabled: `rgba(53, 130, 63, ${lightOpacity})`,
  secondary: '#FFFFFFFF',
  secondaryDisabled: `rgba(53, 130, 63, ${heavyOpacity})`,
  tertiary: '#FFFFFFFF',
  tertiaryDisabled: `rgba(53, 130, 63, ${heavyOpacity})`,
  primaryLight: `rgba(53, 130, 63, ${lightOpacity})`,
  highlight: '#FCBA19',
  primaryBackground: '#000000',
  secondaryBackground: '#313132',
  tertiaryBackground: '#313132',
  modalPrimary: '#42803E',
  modalSecondary: '#FFFFFFFF',
  modalTertiary: '#FFFFFFFF',
  modalPrimaryBackground: '#000000',
  modalSecondaryBackground: '#313132',
  modalTertiaryBackground: '#313132',
  modalIcon: GrayscaleColors.white,
  unorderedList: GrayscaleColors.white,
  unorderedListModal: GrayscaleColors.white,
  link: '#42803E',
  text: GrayscaleColors.white,
  icon: GrayscaleColors.white,
  headerIcon: GrayscaleColors.white,
  headerText: GrayscaleColors.white,
  buttonText: GrayscaleColors.white,
  tabBarInactive: GrayscaleColors.white,
  inlineError: InlineErrorMessageColors.error,
  inlineWarning: InlineErrorMessageColors.warning,
}
export type IBrandColors = typeof BrandColors

const SemanticColors: ISemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399FF',
}

const NotificationColors: INotificationColors = {
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
  popupOverlay: `rgba(0, 0, 0, ${mediumOpacity})`,
}

export const ColorPallet: IColorPallet = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

export const TextTheme = StyleSheet.create({
  headingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  headingTwo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  headingThree: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  headingFour: {
    fontSize: 21,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  normal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.brand.text,
  },
  bold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  labelSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.brand.text,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: ColorPallet.brand.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.brand.text,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ColorPallet.brand.headerText,
  },
  modalNormal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.white,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  modalHeadingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  modalHeadingThree: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  },
  popupModalText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.white,
  },
  settingsText: {
    fontSize: 21,
    fontWeight: 'normal',
    color: ColorPallet.brand.text,
  },
  inlineErrorText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: ColorPallet.brand.inlineError,
  },
  inlineWarningText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: ColorPallet.brand.inlineWarning,
  },
})
export type ITextTheme = typeof TextTheme

export const Inputs = StyleSheet.create({
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
export type IInputs = typeof Inputs

export const Buttons = StyleSheet.create({
  critical: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primary,
  },
  criticalDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  criticalText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  criticalTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
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
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  primaryTextDisabled: {
    ...TextTheme.bold,
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
    ...TextTheme.bold,
    color: ColorPallet.brand.primary,
    textAlign: 'center',
  },
  secondaryTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.secondaryDisabled,
    textAlign: 'center',
  },
  tertiary: {
    padding: 16,
  },
  tertiaryDisabled: {
    padding: 16,
  },
  tertiaryText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.primary,
    textAlign: 'center',
  },
  tertiaryTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.tertiaryDisabled,
    textAlign: 'center',
  },
  modalCritical: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primary,
  },
  modalCriticalDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  modalCriticalText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  modalCriticalTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  modalPrimary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.modalPrimary,
  },
  modalPrimaryDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  modalPrimaryText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  modalPrimaryTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.buttonText,
    textAlign: 'center',
  },
  modalSecondary: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.modalPrimary,
  },
  modalSecondaryDisabled: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.secondaryDisabled,
  },
  modalSecondaryText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.modalPrimary,
    textAlign: 'center',
  },
  modalSecondaryTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.secondaryDisabled,
    textAlign: 'center',
  },
  modalTertiary: {
    padding: 16,
  },
  modalTertiaryDisabled: {
    padding: 16,
  },
  modalTertiaryText: {
    ...TextTheme.bold,
    color: ColorPallet.brand.modalPrimary,
    textAlign: 'center',
  },
  modalTertiaryTextDisabled: {
    ...TextTheme.bold,
    color: ColorPallet.brand.tertiaryDisabled,
    textAlign: 'center',
  },
})
export type IButtons = typeof Buttons

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
  credentialOfferBackground: {
    backgroundColor: ColorPallet.brand.modalPrimaryBackground,
  },
  credentialOfferTitle: {
    ...TextTheme.modalHeadingThree,
    fontWeight: 'normal',
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
    color: ColorPallet.brand.text,
  },
  contactDate: {
    color: ColorPallet.brand.text,
    marginTop: 10,
  },
  contactIconBackground: {
    backgroundColor: ColorPallet.brand.primary,
  },
  contactIcon: {
    color: ColorPallet.grayscale.white,
  },
  recordAttributeLabel: {
    ...TextTheme.bold,
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
  requestTemplateBackground: {
    backgroundColor: ColorPallet.grayscale.white,
  },
  requestTemplateIconColor: {
    color: ColorPallet.notification.infoText,
  },
  requestTemplateTitle: {
    color: ColorPallet.grayscale.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  requestTemplateDetails: {
    color: ColorPallet.grayscale.black,
    fontWeight: 'normal',
    fontSize: 16,
  },
  requestTemplateZkpLabel: {
    color: ColorPallet.grayscale.mediumGrey,
    fontSize: 12,
  },
  requestTemplateIcon: {
    color: ColorPallet.grayscale.black,
    fontSize: 36,
  },
  requestTemplateDate: {
    color: ColorPallet.grayscale.mediumGrey,
    fontSize: 10,
  },
})
export type IListItems = typeof ListItems

const TabThemeBase = StyleSheet.create({
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
  tabBarContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarTextStyle: {
    ...TextTheme.labelSubtitle,
    paddingBottom: 5,
  },
  tabBarButtonIconStyle: {
    color: ColorPallet.brand.headerIcon,
  },
  focusTabIconStyle: {
    height: 60,
    width: 60,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusTabActiveTintColor: {
    backgroundColor: ColorPallet.brand.secondary,
  },
})

const TabThemeExtension = {
  tabBarActiveTintColor: ColorPallet.brand.primary,
  tabBarInactiveTintColor: ColorPallet.brand.tabBarInactive,
  tabBarSecondaryBackgroundColor: ColorPallet.brand.secondaryBackground,
}

export const TabTheme = { ...TabThemeBase, ...TabThemeExtension }
export type ITabTheme = typeof TabTheme

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

export type INavigationTheme = typeof NavigationTheme

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
export type IHomeTheme = typeof HomeTheme

const SettingsThemeBase = StyleSheet.create({
  groupHeader: {
    ...TextTheme.normal,
    marginBottom: 8,
  },
  text: {
    ...TextTheme.caption,
    color: ColorPallet.grayscale.white,
  },
})

const SettingsThemeExtension = {
  groupBackground: ColorPallet.brand.secondaryBackground,
  iconColor: TextTheme.normal.color,
}

export const SettingsTheme = { ...SettingsThemeBase, ...SettingsThemeExtension }
export type ISettingsTheme = typeof SettingsTheme

const ChatThemeBase = StyleSheet.create({
  containerStyle: {
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
  },
  leftBubble: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    borderRadius: 4,
    padding: 16,
    marginLeft: 16,
  },
  rightBubble: {
    backgroundColor: ColorPallet.brand.primaryLight,
    borderRadius: 4,
    padding: 16,
    marginRight: 16,
  },
  timeStyleLeft: {
    color: ColorPallet.grayscale.lightGrey,
    fontSize: 12,
    marginTop: 8,
  },
  timeStyleRight: {
    color: ColorPallet.grayscale.lightGrey,
    fontSize: 12,
    marginTop: 8,
  },
  leftText: {
    color: ColorPallet.brand.secondary,
    fontSize: TextTheme.normal.fontSize,
  },
  leftTextHighlighted: {
    ...TextTheme.bold,
    color: ColorPallet.brand.secondary,
  },
  rightText: {
    color: ColorPallet.brand.secondary,
    fontSize: TextTheme.normal.fontSize,
  },
  rightTextHighlighted: {
    ...TextTheme.bold,
    color: ColorPallet.brand.secondary,
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
  sendContainer: {
    marginBottom: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  openButtonStyle: {
    borderRadius: 32,
    backgroundColor: ColorPallet.brand.primary,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 16,
  },
  openButtonTextStyle: {
    fontSize: TextTheme.normal.fontSize,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  documentIconContainer: {
    backgroundColor: ColorPallet.brand.primary,
    alignSelf: 'flex-start',
    borderRadius: 4,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  documentIcon: {
    color: ColorPallet.grayscale.white,
  },
})

// TODO: Invesitigate if these are still needed.
// Note: They are not currently used in bifold
// extending to allow backwards compatibility.
const ChatThemeExtension = {
  placeholderText: ColorPallet.grayscale.lightGrey,
  sendEnabled: ColorPallet.brand.primary,
  sendDisabled: ColorPallet.brand.primaryDisabled,
  options: ColorPallet.brand.primary,
  optionsText: ColorPallet.grayscale.black,
}

export const ChatTheme = { ...ChatThemeBase, ...ChatThemeExtension }
export type IChatTheme = typeof ChatTheme

const OnboardingThemeBase = StyleSheet.create({
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
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerText: {
    ...TextTheme.bold,
  },
  bodyText: {
    ...TextTheme.normal,
  },
})

const OnboardingThemeExtension = {
  headerTintColor: ColorPallet.grayscale.white,
  imageDisplayOptions: {
    fill: ColorPallet.notification.infoText,
  },
}

export const OnboardingTheme = { ...OnboardingThemeBase, ...OnboardingThemeExtension }
export type IOnboardingTheme = typeof OnboardingTheme

export const DialogTheme = StyleSheet.create({
  modalView: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  titleText: {
    color: ColorPallet.grayscale.white,
  },
  description: {
    color: ColorPallet.grayscale.white,
  },
  closeButtonIcon: {
    color: ColorPallet.grayscale.white,
  },
  carouselButtonText: {
    color: ColorPallet.grayscale.white,
  },
})
export type IDialogTheme = typeof DialogTheme

const LoadingTheme = {
  backgroundColor: ColorPallet.brand.modalPrimaryBackground,
}
export type ILoadingTheme = typeof LoadingTheme

const PINEnterTheme = {
  image: {
    alignSelf: 'center',
    marginBottom: 20,
  },
}
export type IPINEnterTheme = typeof PINEnterTheme

const PINInputTheme = StyleSheet.create({
  cell: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    borderColor: ColorPallet.brand.secondary,
    borderWidth: 1,
  },
  focussedCell: {
    borderColor: ColorPallet.brand.headerIcon,
  },
  cellText: {
    color: ColorPallet.brand.text,
  },
  icon: {
    color: ColorPallet.brand.headerIcon,
  },
  codeFieldRoot: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  labelAndFieldContainer: {
    flexDirection: 'row',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: ColorPallet.brand.secondaryBackground,
    borderColor: ColorPallet.brand.secondary,
    borderWidth: 1,
  },
})
export type IPINInputTheme = typeof PINInputTheme

const CredentialCardShadowTheme = {
  shadowColor: '#000',
  shadowOffset: {
    width: 1,
    height: 1,
  },
  shadowOpacity: 0.3,
} satisfies ViewStyle

const SelectedCredTheme = {
  borderWidth: 5,
  borderRadius: 15,
  borderColor: ColorPallet.semantic.focus,
} satisfies ViewStyle

export const Assets = {
  svg: {
    activityIndicator: ActivityIndicator,
    appLockout: AppLockout,
    biometrics: Biometrics,
    credentialDeclined: CredentialDeclined,
    deleteNotification: DeleteNotification,
    emptyWallet: EmptyWallet,
    contactBook: ContactBook,
    logo: Logo,
    proofRequestDeclined: ProofRequestDeclined,
    arrow: Arrow,
    iconCredentialOfferDark: IconCredentialOfferDark,
    iconCredentialOfferLight: IconCredentialOfferLight,
    iconInfoRecievedDark: IconInfoRecievedDark,
    iconInfoRecievedLight: IconInfoRecievedLight,
    iconInfoSentDark: IconInfoSentDark,
    iconInfoSentLight: IconInfoSentLight,
    iconProofRequestDark: IconProofRequestDark,
    iconProofRequestLight: IconProofRequestLight,
    preface: Preface,
    updateAvailable: UpdateAvailable,
    verifierRequestDeclined: VerifierRequestDeclined,
    noInfoShared: NoInfoShared,
    wallet: Wallet,
    checkInCircle: CheckInCircle,
    credentialCard: CredentialCard,
    walletBack: WalletBack,
    walletFront: WalletFront,
    credentialInHand: CredentialInHand,
    credentialList: CredentialList,
    scanShare: ScanShare,
    secureCheck: SecureCheck,
    secureImage: SecureImage,
    informationReceived: InformationReceived,
    pushNotificationImg: PushNotificationImg,
    chatLoading: ChatLoading,
    historyCardAcceptedIcon: HistoryCardAcceptedIcon,
    historyCardDeclinedIcon: HistoryCardRevokedIcon,
    historyCardExpiredIcon: HistoryCardExpiredIcon,
    historyCardRemovedIcon: HistoryCardRevokedIcon,
    historyCardRevokedIcon: HistoryCardRevokedIcon,
    historyCardUpdatesIcon: HistoryCardAcceptedIcon,
    historyPinUpdatedIcon: HistoryPinUpdatedIcon,
    historyInformationSentIcon: HistoryInformationSentIcon,
    historyInformationNotSentIcon: HistoryCardRevokedIcon,
    historyConnectionIcon: HistoryCardAcceptedIcon,
    historyConnectionRemovedIcon: HistoryCardRevokedIcon,
    historyActivateBiometryIcon: HistoryCardAcceptedIcon,
    historyDeactivateBiometryIcon: HistoryCardRevokedIcon,
    iconChevronRight: IconChevronRight,
    homeCenterImg: HomeCenterImg,
    iconDelete: IconDelete,
    iconEdit: IconEdit,
    iconCode: IconCode,
    iconError: IconError,
    iconWarning: IconWarning,
    tabOneIcon: TabOneIcon,
    tabOneFocusedIcon: TabOneFocusedIcon,
    tabTwoIcon: TabTwoIcon,
    tabThreeIcon: TabThreeIcon,
    tabThreeFocusedIcon: TabThreeFocusedIcon,
  },
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
      height: 120,
      width: 120,
      resizeMode: 'contain',
    },
  },
}

const InputInlineMessage = {
  inlineErrorText: { ...TextTheme.inlineErrorText },
  InlineErrorIcon: Assets.svg.iconError,
  inlineWarningText: { ...TextTheme.inlineWarningText },
  InlineWarningIcon: Assets.svg.iconWarning,
}
export type IInlineInputMessage = typeof InputInlineMessage

export interface ITheme {
  themeName: string
  Spacing: ISpacing
  ColorPallet: IColorPallet
  TextTheme: ITextTheme
  InputInlineMessage: IInlineInputMessage
  Inputs: IInputs
  Buttons: IButtons
  ListItems: IListItems
  TabTheme: ITabTheme
  NavigationTheme: INavigationTheme
  HomeTheme: IHomeTheme
  SettingsTheme: ISettingsTheme
  ChatTheme: IChatTheme
  OnboardingTheme: IOnboardingTheme
  DialogTheme: IDialogTheme
  LoadingTheme: ILoadingTheme
  PINEnterTheme: IPINEnterTheme
  PINInputTheme: IPINInputTheme
  CredentialCardShadowTheme: ViewStyle
  SelectedCredTheme: ViewStyle
  heavyOpacity: typeof heavyOpacity
  borderRadius: typeof borderRadius
  borderWidth: typeof borderWidth
  maxFontSizeMultiplier: number
  Assets: IAssets
}

export const bifoldTheme: ITheme = {
  themeName: 'bifold',
  Spacing,
  ColorPallet,
  TextTheme,
  InputInlineMessage,
  Inputs,
  Buttons,
  ListItems,
  TabTheme,
  NavigationTheme,
  HomeTheme,
  SettingsTheme,
  ChatTheme,
  OnboardingTheme,
  DialogTheme,
  LoadingTheme,
  PINEnterTheme,
  PINInputTheme,
  CredentialCardShadowTheme,
  SelectedCredTheme,
  heavyOpacity,
  borderRadius,
  borderWidth,
  maxFontSizeMultiplier,
  Assets,
}

export const themes: ITheme[] = [bifoldTheme]
