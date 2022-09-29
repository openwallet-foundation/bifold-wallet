import {
  Agent,
  AgentProvider,
  AuthProvider,
  ConfigurationContext,
  ConfigurationProvider,
  StoreProvider,
  ThemeProvider,
  theme,
  initLanguages,
  initStoredLanguage,
  translationResources,
  ErrorModal,
  toastConfig,
  RootStack,
  OnboardingPages,
  Splash,
  Privacy,
  Terms,
} from "aries-bifold";
import React, { useEffect, useState } from "react";
import { AppState, Platform, StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import Toast from "react-native-toast-message";

const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  privacy: Privacy,
  terms: Terms,
};

initLanguages(translationResources);

const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined);
    let nextState: string | undefined
  
    useEffect(() => {
      if (Platform.OS === 'ios') {
        const subscription = AppState.addEventListener("change", async (nextAppState) => {
          console.log("Next App State", nextAppState)
          nextState = nextAppState
    
          if(nextAppState === 'active') {
            connectToPools()
          }
    
          if(nextAppState === 'background'){
            console.log("Closing All Opened Pools")
            agent?.ledger.pools.forEach(async (pool) => {
              console.log("Closing Pool", pool.id)
              await pool.close()
              console.log("Closed Pool", pool.id)
            })
          }
        })
    
        return () => {
          subscription.remove();
        };
      }    
    }, [agent])
  
    const connectToPools = async () => {
      if(agent){
        console.log("Connecting to all pools")
        for(const pool of agent.ledger.pools){
          if((nextState && nextState === 'active') || (!nextState && AppState.currentState === 'active')){
            try{
              console.log('Connecting to Pool', pool.id)
              await pool.connect()
              console.log("Connected to Pool", pool.id)
            }
            catch (error){
              console.warn("Error while attempting pool ledger connection", error)
            }
            
            // Close any pools that opened while we closed all other pools
            try{
              if(AppState.currentState === 'background'){
                console.log("App connected after backgrounded, closing pool", pool.id)
                await pool.close()
                console.log("Pool closed after backgrounded", pool.id)
              }
            } catch (error){
              console.warn("Error while closing Pool after backgrounded!", error)
            }
            
          }
          else{
            console.log(`Skipped connecting to pool due to app state not being active, App State: ${AppState.currentState}`, pool.id)
          }
  
        }
      }
    }
  
    useEffect(() => {
      //On first launch of agent connect to pools if the OS is iOS, otherwise the AFJ config will auto async connect
      if (Platform.OS === 'ios') {
        connectToPools()
      }
    }, [agent])
  
  initStoredLanguage();

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide();
  }, []);

  return (
    <StoreProvider>
      <AgentProvider agent={agent}>
        <ThemeProvider value={theme}>
          <ConfigurationProvider value={defaultConfiguration}>
            <AuthProvider>
              <StatusBar
                barStyle="light-content"
                hidden={false}
                backgroundColor={theme.ColorPallet.brand.primary}
                translucent={false}
              />
              <ErrorModal />
              <RootStack agent={agent} setAgent={setAgent} />
              <Toast topOffset={15} config={toastConfig} />
            </AuthProvider>
          </ConfigurationProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  );
};

export default App;