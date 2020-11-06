import React, {useState, useEffect, NativeModules} from 'react';
import {
  Text,
  View
} from 'react-native';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation 
} from 'react-router-native'
import Agent from 'aries-mobileagent-react-native'

import Notifications from './components/Notifications.js'
import Errors from './components/Errors.js'
import EntryPoint from './components/EntryPoint.js'



//Libindy Native Bridging
const {Indy} = NativeModules



const App: () => React$Node = (props) => {
  let location = useLocation();
  useEffect(()=>{
    console.log("Route Change:", location.pathname)
  }, [location])

  const [authenticated, setAuthenticated] = useState(false)
  /*
    /
    /home
    /start
    /pin-entry
    /pin-create
    /scan
    /workflow
    /settings
  */

  return (
    <View>
      <Errors>
        <Notifications>
          <View>
            <Switch>
              <Route
                exact
                path='/'
                render={() => {
                  return (
                    <EntryPoint />
                  )
                }}
              />
              <Route render={() => {
                console.warn(`Unidentified Path: ${location.pathname} - Redirecting...`)
                return(
                  <Redirect to="/" />
                )
              }} />
            </Switch>
          </View>
      </Notifications>
      </Errors>
    </View>
  );
};


export default App;
