import { GenericFn } from './fn'

export interface Setting {
  title: string
  value?: string
  onPress?: GenericFn
  accessibilityLabel?: string
  testID?: string
}

export interface SettingIcon {
  name: string
  size?: number
  style?: any
  action?: () => void
  accessibilityLabel?: string
}

export interface SettingSection {
  header: {
    title: string
    icon: SettingIcon
    iconRight?: SettingIcon
  }
  data: Setting[]
}
