import { TouchableOpacity } from 'react-native'

export enum ButtonType {
  Critical,
  Primary,
  Secondary,
  ModalCritical,
  ModalPrimary,
  ModalSecondary,
}

export interface ButtonProps extends React.PropsWithChildren {
  title: string
  buttonType: ButtonType
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
  onPress?: () => void
  disabled?: boolean
}

export enum ButtonState {
  Default = 'default',
  Disabled = 'disabled',
  Active = 'active',
}

export enum ButtonStyleNames {
  Critical_Default = 'Critical' + '_' + ButtonState.Default,
  Critical_Disabled = 'Critical' + '_' + ButtonState.Disabled,
  Critical_Active = 'Critical' + '_' + ButtonState.Active,
}
/*
type stylesType = { readonly [key in ButtonStyleNames]?: ViewStyle | TextStyle | ImageStyle}
const styles: stylesType = StyleSheet.create({
  [ButtonStyleNames.Critical_Default]: {},
  [ButtonType.Secondary]: {},
  [ButtonType.ModalCritical]: {},
  [ButtonType.ModalPrimary]: {},
  [ButtonType.ModalSecondary]: {},
})
*/
export type Button = React.FC<ButtonProps & React.RefAttributes<TouchableOpacity>>
