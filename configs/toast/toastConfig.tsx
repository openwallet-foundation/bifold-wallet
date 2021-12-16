import React from 'react'

import { Colors } from '../../App/Theme'

import BaseToast from './BaseToast'

export const toastConfig = {
  success: (props: any) => <BaseToast backgroundColor={Colors.green} icon="check-circle" title={props.text1} />,
  error: (props: any) => <BaseToast backgroundColor={Colors.red} icon="cancel" title={props.text1} />,
  info: (props: any) => <BaseToast backgroundColor={Colors.shadow} icon="alarm" title={props.text1} />,
}

export default toastConfig
