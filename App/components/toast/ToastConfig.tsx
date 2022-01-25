import React from 'react'

import { Colors } from '../../theme'

import BaseToast from './BaseToast'

export const toastConfig = {
  success: (props: any) => <BaseToast backgroundColor={Colors.success} icon="check-circle" title={props.text1} />,
  error: (props: any) => <BaseToast backgroundColor={Colors.error} icon="cancel" title={props.text1} />,
  info: (props: any) => <BaseToast backgroundColor={Colors.info} icon="alarm" title={props.text1} />,
}

export default toastConfig
