import React, {useState, useContext} from 'react'
import { Text } from 'react-native'

const ErrorsContext = React.createContext({})

function ErrorDialog (props) {
	return(
		<Text>{props.text}</Text>
	)
}

function Errors (props) {
	const [visible, setVisible] = useState(false);
	const [text, setText] = useState('')

	return (
    <ErrorsContext.Provider value={{setVisible: setVisible, setText: setText}}>
    	{
    		visible ? (
	    		<ErrorDialog text={text}/>
	    	) : null
    	}
			{props.children}
    </ErrorsContext.Provider>
	)
}

export default Errors
export {
	ErrorsContext
}