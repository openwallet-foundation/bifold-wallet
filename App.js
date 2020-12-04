import React, {useState, useEffect} from 'react';
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

import { v4 as uuidv4 } from 'uuid'

import Notifications from './components/Notifications.js'
import Errors from './components/Errors.js'
import EntryPoint from './components/EntryPoint.js'


const App = (props) => {
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
