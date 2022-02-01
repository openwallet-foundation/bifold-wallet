import React from 'react'
import { ToastShowParams } from 'react-native-toast-message'

import BaseToast, { ToastType } from './BaseToast'

export const toastConfig = {
  success: (props: ToastShowParams) => (
    <BaseToast title={props.text1!} body={props.text2!} toastType={ToastType.Success} />
  ),
  warn: (props: ToastShowParams) => <BaseToast title={props.text1!} body={props.text2!} toastType={ToastType.Warn} />,
  error: (props: ToastShowParams) => <BaseToast title={props.text1!} body={props.text2!} toastType={ToastType.Error} />,
  info: (props: ToastShowParams) => <BaseToast title={props.text1!} body={props.text2!} toastType={ToastType.Info} />,
}

export default toastConfig
