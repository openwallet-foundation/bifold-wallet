import { TextStyle, ViewStyle } from 'react-native'
import { SvgProps } from 'react-native-svg'

interface ITextThemeStyle {
  fontSize: number
  fontWeight: TextStyle['fontWeight']
  color: string
}

export interface ITextTheme {
  headingOne: TextStyle & ITextThemeStyle
  headingTwo: TextStyle & ITextThemeStyle
  headingThree: TextStyle & ITextThemeStyle
  headingFour: TextStyle & ITextThemeStyle
  normal: TextStyle & ITextThemeStyle
  bold: TextStyle & ITextThemeStyle
  label: TextStyle & ITextThemeStyle
  labelTitle: TextStyle & ITextThemeStyle
  labelSubtitle: TextStyle & ITextThemeStyle
  labelText: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    fontStyle: TextStyle['fontStyle']
    color: string
  }
  caption: TextStyle & ITextThemeStyle
  title: TextStyle & ITextThemeStyle
  headerTitle: TextStyle & ITextThemeStyle
  modalNormal: TextStyle & ITextThemeStyle
  modalTitle: TextStyle & ITextThemeStyle
  modalHeadingOne: TextStyle & {
    fontSize: number
    color: string
    fontWeight?: TextStyle['fontWeight'] // Optional for backwards compatibility
  }
  modalHeadingThree: TextStyle & {
    fontSize: number
    color: string
    fontWeight?: TextStyle['fontWeight'] // Optional for backwards compatibility
  }
  popupModalText: TextStyle & ITextThemeStyle
  settingsText: TextStyle & ITextThemeStyle
  inlineErrorText: TextStyle & ITextThemeStyle
  inlineWarningText: TextStyle & ITextThemeStyle
}

export interface IInputs {
  label: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    color: string
  }
  textInput: TextStyle & {
    padding: number
    borderRadius: number
    fontSize: number
    backgroundColor: string
    color: string
    borderWidth: number
    borderColor: string
  }
  singleSelectText: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    color: string
  }
  singleSelectIcon: TextStyle & {
    color: string
  }
  checkBoxColor: TextStyle & {
    color: string
  }
  checkBoxText: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    color: string
  }
  inputSelected: ViewStyle & {
    borderColor: string
  }
  singleSelect: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
}

export interface IButtons {
  // Optional for backwards compatibility
  criticalText?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  criticalTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  primaryText: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  primaryTextDisabled: TextStyle & {
    textAlign: TextStyle['textAlign']
  }
  secondaryText: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  secondaryTextDisabled: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  tertiaryText?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  tertiaryTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  modalCriticalText?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  modalCriticalTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  modalPrimaryText: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  modalPrimaryTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  modalSecondaryText: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  modalSecondaryTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  modalTertiaryText?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  modalTertiaryTextDisabled?: TextStyle & {
    color: string
    textAlign: TextStyle['textAlign']
  }
  // Optional for backwards compatibility
  critical?: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  // Optional for backwards compatibility
  criticalDisabled?: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  primary: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  // Optional for backwards compatibility
  primaryDisabled?: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  secondary: ViewStyle & {
    padding: number
    borderRadius: number
    borderWidth: number
    borderColor: string
  }
  secondaryDisabled: ViewStyle & {
    padding: number
    borderRadius: number
    borderWidth: number
    borderColor: string
  }
  // Optional for backwards compatibility
  tertiary?: ViewStyle & {
    padding: number
  }
  // Optional for backwards compatibility
  tertiaryDisabled?: ViewStyle & {
    padding: number
  }
  modalCritical: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  // Optional for backwards compatibility
  modalCriticalDisabled?: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  modalPrimary: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  // Optional for backwards compatibility
  modalPrimaryDisabled?: ViewStyle & {
    padding: number
    borderRadius: number
    backgroundColor: string
  }
  modalSecondary: ViewStyle & {
    padding: number
    borderRadius: number
    borderWidth: number
    borderColor: string
  }
  // Optional for backwards compatibility
  modalSecondaryDisabled?: ViewStyle & {
    padding: number
    borderRadius: number
    borderWidth: number
    borderColor: string
  }
  // Optional for backwards compatibility
  modalTertiary?: ViewStyle & {
    padding: number
  }
  // Optional for backwards compatibility
  modalTertiaryDisabled?: ViewStyle & {
    padding: number
  }
}

export interface IListItems {
  credentialTitle: TextStyle
  credentialDetails: TextStyle
  credentialOfferTitle: TextStyle & {
    fontWeight?: TextStyle['fontWeight'] // Optional for backwards compatibility
  }
  credentialOfferDetails: TextStyle
  credentialIconColor: TextStyle & {
    color: string
  }
  contactTitle: TextStyle & {
    color: string
  }
  contactDate: TextStyle & {
    color: string
    marginTop: number
  }
  contactIcon: TextStyle & {
    color: string
  }
  recordAttributeLabel: TextStyle
  recordLink: TextStyle & {
    color: string
  }
  recordAttributeText: TextStyle
  proofIcon: TextStyle
  proofError: TextStyle & {
    color: string
  }
  avatarText: TextStyle & {
    fontWeight: TextStyle['fontWeight']
  }
  avatarCircle: ViewStyle & {
    borderRadius: number
    borderColor: string
    width: number
    height: number
  }
  requestTemplateIconColor: TextStyle & {
    color: string
  }
  requestTemplateTitle: TextStyle & {
    color: string
    fontWeight: TextStyle['fontWeight']
    fontSize?: number // Optional for backwards compatibility
  }
  requestTemplateDetails: TextStyle & {
    color: string
    fontWeight: TextStyle['fontWeight']
    fontSize?: number // Optional for backwards compatibility
  }
  requestTemplateZkpLabel: TextStyle & {
    color: string
    fontSize?: number // Optional for backwards compatibility
  }
  requestTemplateIcon: TextStyle & {
    color: string
    fontSize?: number // Optional for backwards compatibility
  }
  requestTemplateDate: TextStyle & {
    color: string
    fontSize?: number // Optional for backwards compatibility
  }
  credentialBackground: ViewStyle & {
    backgroundColor: string
  }
  credentialOfferBackground: ViewStyle & {
    backgroundColor: string
  }
  revoked: ViewStyle & {
    backgroundColor: string
    borderColor: string
  }
  contactBackground: ViewStyle & {
    backgroundColor: string
  }
  contactIconBackground: ViewStyle & {
    backgroundColor: string
  }
  recordContainer: ViewStyle & {
    backgroundColor: string
  }
  recordBorder: ViewStyle & {
    borderBottomColor: string
  }
  emptyList: TextStyle
  requestTemplateBackground: ViewStyle & {
    backgroundColor: string
  }
}

export interface ITabTheme {
  tabBarTextStyle: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    color: string
    paddingBottom: number
  }
  tabBarButtonIconStyle: TextStyle & {
    color: string
  }
  tabBarStyle: ViewStyle & {
    height: number
    backgroundColor: string
    shadowOffset: { width: number; height: number }
    shadowRadius: number
    shadowColor: string
    shadowOpacity: number
    borderTopWidth: number
    paddingBottom: number
  }
  tabBarContainerStyle: ViewStyle & {
    flex: number
    justifyContent: ViewStyle['justifyContent']
    alignItems: ViewStyle['alignItems']
  }
  focusTabIconStyle: TextStyle & {
    height: number
    width: number
    backgroundColor: string
    borderRadius: number
    justifyContent: 'center'
    alignItems: 'center'
  }
  focusTabActiveTintColor: TextStyle & {
    backgroundColor: string
  }
  tabBarActiveTintColor: string
  tabBarInactiveTintColor: string
  tabBarSecondaryBackgroundColor: string
}

export interface IHomeTheme {
  welcomeHeader: TextStyle & ITextThemeStyle
  credentialMsg: TextStyle & ITextThemeStyle
  notificationsHeader: TextStyle & ITextThemeStyle
  noNewUpdatesText: TextStyle & ITextThemeStyle & { color: string }
  link: TextStyle & ITextThemeStyle & { color: string }
}

export interface ISettingsTheme {
  groupHeader: TextStyle & ITextThemeStyle & { marginBottom: number }
  text: TextStyle & ITextThemeStyle & { color: string }
  groupBackground: string
  iconColor: string
}

export interface IChatTheme {
  timeStyleLeft: TextStyle & {
    color: string
    fontSize: number
    marginTop: number
  }
  timeStyleRight: TextStyle & {
    color: string
    fontSize: number
    marginTop: number
  }
  leftText: TextStyle & {
    color: string
    fontSize: number
  }
  leftTextHighlighted: TextStyle & {
    color: string
  } & Partial<TextStyle>
  rightText: TextStyle & {
    color: string
    fontSize: number
  }
  rightTextHighlighted: TextStyle & {
    color: string
  } & Partial<TextStyle>
  inputText: TextStyle & {
    fontWeight: TextStyle['fontWeight']
    fontSize: number
    lineHeight?: number
  }
  openButtonTextStyle: TextStyle & {
    fontSize: number
    fontWeight: TextStyle['fontWeight']
    textAlign: TextStyle['textAlign']
  }
  documentIcon: TextStyle & {
    color: string
  }

  containerStyle: ViewStyle & {
    marginBottom: number
    marginLeft: number
    marginRight: number
    flexDirection: ViewStyle['flexDirection']
    alignItems: ViewStyle['alignItems']
    alignSelf: ViewStyle['alignSelf']
  }
  leftBubble: ViewStyle & {
    backgroundColor: string
    borderRadius: number
    padding: number
    marginLeft: number
  }
  rightBubble: ViewStyle & {
    backgroundColor: string
    borderRadius: number
    padding: number
    marginRight: number
  }
  sendContainer: ViewStyle & {
    marginBottom: number
    paddingHorizontal: number
    justifyContent: ViewStyle['justifyContent']
  }
  openButtonStyle: ViewStyle & {
    borderRadius: number
    backgroundColor: string
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    marginTop: number
  }
  documentIconContainer: ViewStyle & {
    backgroundColor: string
    alignSelf: ViewStyle['alignSelf']
    borderRadius: number
    marginBottom: number
    justifyContent?: ViewStyle['justifyContent'] // Optional for backward compatibility
    alignItems?: ViewStyle['alignItems'] // Optional for backward compatibility
    width?: number // Optional for backward compatibility
    height?: number // Optional for backward compatibility
  }
  inputToolbar: ViewStyle & {
    backgroundColor: string
    shadowColor: string
    borderRadius: number
  }

  // Optional legacy properties for backward compatibility
  placeholderText: string
  sendEnabled: string
  sendDisabled: string
  options: string
  optionsText: string
}

export interface IDialogTheme {
  modalView: ViewStyle & {
    backgroundColor: string
  }
  titleText: TextStyle & {
    color: string
  }
  description: TextStyle & {
    color: string
  }
  closeButtonIcon: TextStyle & {
    color: string
  }
  carouselButtonText: TextStyle & {
    color: string
  }
}

export interface IOnboardingTheme {
  pagerDot: TextStyle & {
    borderColor: string
  }
  pagerDotActive: TextStyle & {
    color: string
  }
  pagerDotInactive: TextStyle & {
    color: string
  }
  pagerNavigationButton: TextStyle & {
    color: string
    fontWeight: TextStyle['fontWeight']
    fontSize: number
  }
  headerText: TextStyle
  bodyText: TextStyle
  container: ViewStyle & {
    backgroundColor: string
  }
  carouselContainer: ViewStyle & {
    backgroundColor: string
  }
  headerTintColor: string
  imageDisplayOptions: {
    fill: string
  }
}

export interface ILoadingTheme {
  backgroundColor: string
}

export interface IPINInputTheme {
  cellText: TextStyle & {
    color: string
  }
  icon: TextStyle & {
    color: string
  }
  cell: ViewStyle & {
    backgroundColor: string
    borderColor: string
    borderWidth?: number // Optional for backward compatibility
  }
  focussedCell: ViewStyle & {
    borderColor: string
  }
  codeFieldRoot: ViewStyle & {
    justifyContent: ViewStyle['justifyContent']
    alignItems: ViewStyle['alignItems']
  }
  labelAndFieldContainer: ViewStyle & {
    flexDirection: ViewStyle['flexDirection']
    borderRadius: number
    paddingHorizontal: number
    paddingVertical: number
    alignItems: ViewStyle['alignItems']
    backgroundColor: string
    borderColor: string
    borderWidth?: number // Optional for backward compatibility
  }
}

export interface IInlineInputMessage {
  inlineErrorText: TextStyle & ITextThemeStyle
  InlineErrorIcon: React.FC<SvgProps>
  inlineWarningText: TextStyle & ITextThemeStyle
  InlineWarningIcon: React.FC<SvgProps>
}
