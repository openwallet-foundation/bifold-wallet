import React, {useState, useContext} from 'react'
import { Text } from 'react-native'

const NotificationsContext = React.createContext({})

function Notification (props) {
	return(
		<Text>{props.text}</Text>
	)
}

function Notifications (props) {
	const [visible, setVisible] = useState(false);
	const [text, setText] = useState('')

	return (
    <NotificationsContext.Provider value={{setVisible: setVisible, setText: setText}}>
    	{
    		visible ? (
	    		<Notification text={text}/>
	    	) : null
    	}
			{props.children}
    </NotificationsContext.Provider>
	)
}

export default Notifications
export {
	NotificationsContext
}