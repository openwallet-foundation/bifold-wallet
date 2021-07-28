import React, { useState, useContext } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

import AppStyles from '../../assets/styles'

const ErrorsContext = React.createContext({})

interface IErrorDialog {
  path: string
  text: string
}

function ErrorDialog(props: IErrorDialog) {
  const errors = useContext<any>(ErrorsContext)

  return (
    <>
      <View style={styles.errorView}>
        <View style={[AppStyles.messageBox, styles.errorMessage]}>
          <Text style={[AppStyles.h2, AppStyles.textSecondary, AppStyles.textBold]}>ERROR{'\n'}</Text>
          <Text style={[AppStyles.h3, AppStyles.textSecondary]}>{props.text}</Text>
          <TouchableOpacity
            style={[AppStyles.button, AppStyles.backgroundSecondary, { marginTop: 30 }]}
            onPress={() => {
              errors.setVisible(false)
            }}
          >
            <Text style={[AppStyles.h2, AppStyles.textWhite]}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

interface Props {
  children: React.ReactNode
}

const Errors: React.FC<Props> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')
  const [path, setPath] = useState('')

  return (
    <ErrorsContext.Provider value={{ setVisible: setVisible, setText: setText, setPath: setPath }}>
      <View>
        {children}
        {visible ? (
          <>
            <ErrorDialog text={text} path={path} />
          </>
        ) : null}
      </View>
    </ErrorsContext.Provider>
  )
}

export default Errors
export { ErrorsContext }

const styles = StyleSheet.create({
  errorView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.78)',
  },
  errorMessage: {
    bottom: 40,
    width: '84%',
    height: '44%',
  },
})
