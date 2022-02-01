import React from 'react'

import { StatusColors } from '../../theme'

import BaseToast from './BaseToast'

export const toastConfig = {
  success: (props: any) => (
    <BaseToast backgroundColor="#DFF0D8" icon="check-circle" title={props.text1} body={props.text2} />
  ),
  error: (props: any) => (
    <BaseToast backgroundColor={StatusColors.error} icon="cancel" title={props.text1} body={props.text2} />
  ),
  info: (props: any) => (
    <BaseToast backgroundColor={StatusColors.info} icon="alarm" title={props.text1} body={props.text2} />
  ),
}

export default toastConfig
