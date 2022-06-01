import {
  Agent,
  AgentProvider,
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
  Terms,
} from "aries-bifold";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import Toast from "react-native-toast-message";
import TouchID from "react-native-touch-id";
import BioAuthScreen from "./bioAuthScreen";

const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  terms: Terms,
};

initLanguages(translationResources);

const optionalConfigObject = {
  title: "Authentication Required", // Android
  imageColor: "#e00606", // Android
  imageErrorColor: "#ff0000", // Android
  sensorDescription: "Touch sensor", // Android
  sensorErrorDescription: "Failed", // Android
  cancelText: "Cancel", // Android
  fallbackLabel: "Show Passcode", // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

const App = () => {
  initStoredLanguage();
  const [agent, setAgent] = useState<Agent | undefined>(undefined);
  const [bioAuth, setBioAuth] = useState<boolean>(false);

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide();

    // setup biometric authentication
    TouchID.isSupported(optionalConfigObject)
      .then((biometryType) => {
        // Success code
        if (biometryType === "FaceID") {
          console.log("FaceID is supported.");
        } else {
          console.log("TouchID is supported.");
        }
        TouchID.authenticate("Open App", optionalConfigObject)
          .then(() => {
            setBioAuth(true);
            console.log("Authenticated");
          })
          .catch(console.log);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }, []);

  if (!bioAuth) {
    return <BioAuthScreen />;
  }

  return (
    <StoreProvider>
      <AgentProvider agent={agent}>
        <ThemeProvider value={theme}>
          <ConfigurationProvider value={defaultConfiguration}>
            <StatusBar
              barStyle="light-content"
              hidden={false}
              backgroundColor={theme.ColorPallet.brand.primary}
              translucent={false}
            />
            <ErrorModal />
            <RootStack setAgent={setAgent} />
            <Toast topOffset={15} config={toastConfig} />
          </ConfigurationProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  );
};

export default App;
