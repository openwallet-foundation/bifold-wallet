import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View, Platform, Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { ColorPallet, TextTheme } from '../theme'
import { CredentialStackParams, Screens } from '../types/navigators'
import { WebView } from 'react-native-webview';

import Record2 from '../components/record2/Record2'
import { ToastType } from '../components/toast/BaseToast'
import type { OCA, 
              CaptureBase, 
              EntryOverlay, 
              MetaOverlay, 
              EntryCodeOverlay, 
              LabelOverlay, 
              FormLayoutOverlay, 
              InformationOverlay, 
              CredentialLayoutOverlay, 
              FormatOverlay } from 'oca.js'
import { OcaJs } from '../OcaJs'
//const OcaJs = require('oca.js-form-core');
const structureJson = require("./structure.json");
const ourStoryHTML = require ('./html.js')
const testUltimeHTML = require ('./index.html')
import jsYaml, { load } from 'js-yaml'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const styles = StyleSheet.create({
  headerText: {
    ...TextTheme.normal,
  },
  footerText: {
    ...TextTheme.normal,
    paddingTop: 16,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
})

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()

  let webview = React.createRef<WebView<{}>>();

  // https://repository.oca.argo.colossi.network/api/v4/schemas/E0ttcf4zZhRiTkazvq8X4T69q3hzug6t8zR8mAaMCe1U


  const credentalLayout: CredentialLayoutOverlay = {
    capture_base: '',
    type: '',
    layout: ''
  }
  
  const captureBase: CaptureBase = {
    attributes: {"dateOfBirth":"Date","credentialSubject.lastName":"Text"},
    classification: "", // C'est quoi cet attribut?
    pii: ["dateOfBirth","credentialSubject.lastName"],
    type: "spec/capture_base/1.0",
  };

  const frLabelOverlay: LabelOverlay = {
    capture_base: "EPMaG1h2hVxKCZ5_3KoNNwgAyd4Eq8zrxK3xgaaRsz2M", // Comment on génère un SAI?
    type: "spec/overlays/label/1.0",
    language: "fr",
    attr_labels: {"dateOfBirth":"Date de naissance","credentialSubject.lastName":"Nom"},
    attr_categories: ["_cat-1_","_cat-2_"],
    cat_labels: { "_cat-1_": "Catégorie 1", "_cat-2_": "Catégorie 2" },
    cat_attributes: { "_cat-1_": ["dateOfBirth"], "_cat-2_": ["credentialSubject.lastName"]}
  };

  const enLabelOverlay: LabelOverlay = {
    capture_base: "EPMaG1h2hVxKCZ5_3KoNNwgAyd4Eq8zrxK3xgaaRsz2M",
    type: "spec/overlays/label/1.0",
    language: "en",
    attr_labels: {"dateOfBirth":"Date of birth","credentialSubject.lastName":"Lastname"},
    attr_categories: ["_cat-1_","_cat-2_"],
    cat_labels: { "_cat-1_": "Catégorie 1", "_cat-2_": "Catégorie 2" },
    cat_attributes: { "_cat-1_": ["dateOfBirth"], "_cat-2_": ["credentialSubject.lastName"]}
  };

  const oca: OCA = {
    capture_base: captureBase,
    overlays: [frLabelOverlay, enLabelOverlay]
  };

  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('CredentialOffer.CredentialNotFound'))
      }

      return useCredentialById(credentialId)
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('CredentialOffer.CredentialNotFound'),
      })

      navigation.goBack()
    }
  } 

  if (!route.params.credentialId) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }

  
  const credential = getCredentialRecord(route.params.credentialId)

  fetch('https://repository.oca.argo.colossi.network/api/v4/schemas/E0ttcf4zZhRiTkazvq8X4T69q3hzug6t8zR8mAaMCe1U').then((response) => response.json()).then(schema => {
      
    let pii = schema.capture_base.pii_attributes;
    delete schema.capture_base.pii_attributes;
    schema.capture_base.pii = pii;
    const ocaJs = new OcaJs({}); 
    ocaJs.createStructure(schema).then(ocaStructure => {
      const dataRepo = {
        EYz7AI0ePCPnpmTpM0CApKoMzBA5bkwek1vsRBEQuMdQ: {
          drivingLicenseID: 'I12345678',
          expirationDate: '08/31/2019',
          lastName: 'Card',
          firstName: 'Holder',
          buildingNumber: '3570',
          street: '21th Street',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95818',
          dateOfBirth: '08/29/1977',
          restrictions: 'None',
          class: 'C',
          endorsements: 'None',
          sex: 'M',
          hairColor: 'brn',
          eyesColor: 'blu',
          height: '5\'-55"',
          weight: '125',
          documentDiscriminator: '09/30/201060221/21FD/18',
          issueDate: '09/06/2010'
        },
        EPMaG1h2hVxKCZ5_3KoNNwgAyd4Eq8zrxK3xgaaRsz2M: {
          documentType: 'PA',
          issuingStateCode: 'che',
          documentNumber: 'c0000000',
          primaryIdentifier: 'John',
          secondaryIdentifier: 'Citizen',
          nationality: 'CHE',
          dateOfBirth: '28.01.0000',
          personalNumber: '',
          sex: 'M',
          placeOfBirth: 'Luzern LU',
          optionalPersonalData: '170',
          dateOfIssue: '12.07.0000',
          issuedBy: 'Luzern LU',
          dateOfExpiry: '11.07.0000',
          photoImage: '',
          signatureImage: ''
        }
      } 
    let layout = jsYaml.load(structureJson.credentialLayout, { schema: jsYaml.JSON_SCHEMA });
    if (webview && webview.current) {
      webview.current.injectJavaScript("renderOCACredential(" + JSON.stringify(structureJson) + ", " + JSON.stringify(dataRepo['EYz7AI0ePCPnpmTpM0CApKoMzBA5bkwek1vsRBEQuMdQ']) + ", { dataVaultUrl: 'https://data-vault.argo.colossi.network/api/v1/files'}, " + JSON.stringify(layout) + "); true;");        
    }   
      for (let control of ocaStructure.controls) {
        //if (!credential) continue;
        for (let credentialAttribute of credential.credentialAttributes) {
          if (!credentialAttribute.displayValue) credentialAttribute.displayValue = credentialAttribute.value;
          if (credentialAttribute.name === control.name) {
            credentialAttribute.label = control.translations.fr_FR.label;
            if (control.type === 'Date') {
              console.log(control.format);  
              let dateValue = new Date();
              if (credentialAttribute.value.length === 8 && !isNaN(parseInt(credentialAttribute.value))) {
                const year = parseInt(credentialAttribute.value.substring(0,4)); 
                const month = parseInt(credentialAttribute.value.substring(4,6)); 
                const day = parseInt(credentialAttribute.value.substring(6,8)); 
                
                dateValue = new Date(year,month - 1,day);    
              }
              if (control.format === 'YYYY-MM-DD') {
                credentialAttribute.displayValue = dateValue.getFullYear() + '-'; 
                credentialAttribute.displayValue += dateValue.getMonth() + 1 < 10 ? '0' + (dateValue.getMonth() + 1) + '-' : (dateValue.getMonth() + 1) + '-';
                credentialAttribute.displayValue += dateValue.getDate() < 10 ? '0' + dateValue.getDate() + '' : dateValue.getDate() + '';
              }
              if (control.format === 'DD/MM/YYYY') {
                credentialAttribute.displayValue = dateValue.getDate() < 10 ? '0' + dateValue.getDate() + '/' : dateValue.getDate() + '/';
                credentialAttribute.displayValue += dateValue.getMonth() + 1 < 10 ? '0' + (dateValue.getMonth() + 1) + '/' : (dateValue.getMonth() + 1) + '/';
                credentialAttribute.displayValue += dateValue.getFullYear(); 
              }
            } 
          }
        }
      }  
  /*    
      Alert.alert(   
        "Alert Title",
        'Test: ' +JSON.stringify(ocaStructure.controls) , 
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );    
      */
    })
    .catch(error => {
      console.log(error);
    });
  });

  /*
  const ocaJs = new OcaJs({});
  ocaJs.createStructure(oca).then(ocaStructure => {

    const dataRepo = {
      EYz7AI0ePCPnpmTpM0CApKoMzBA5bkwek1vsRBEQuMdQ: {
        drivingLicenseID: 'I12345678',
        expirationDate: '08/31/2019',
        lastName: 'Card',
        firstName: 'Holder',
        buildingNumber: '3570',
        street: '21th Street',
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95818',
        dateOfBirth: '08/29/1977',
        restrictions: 'None',
        class: 'C',
        endorsements: 'None',
        sex: 'M',
        hairColor: 'brn',
        eyesColor: 'blu',
        height: '5\'-55"',
        weight: '125',
        documentDiscriminator: '09/30/201060221/21FD/18',
        issueDate: '09/06/2010'
      },
      EPMaG1h2hVxKCZ5_3KoNNwgAyd4Eq8zrxK3xgaaRsz2M: {
        documentType: 'PA',
        issuingStateCode: 'che',
        documentNumber: 'c0000000',
        primaryIdentifier: 'John',
        secondaryIdentifier: 'Citizen',
        nationality: 'CHE',
        dateOfBirth: '28.01.0000',
        personalNumber: '',
        sex: 'M',
        placeOfBirth: 'Luzern LU',
        optionalPersonalData: '170',
        dateOfIssue: '12.07.0000',
        issuedBy: 'Luzern LU',
        dateOfExpiry: '11.07.0000',
        photoImage: '',
        signatureImage: ''
      }
    }
 


    let layout = jsYaml.load(structureJson.credentialLayout, { schema: jsYaml.JSON_SCHEMA });
    if (webview && webview.current) {
      webview.current.injectJavaScript("renderOCACredential(" + JSON.stringify(structureJson) + ", " + JSON.stringify(dataRepo['EYz7AI0ePCPnpmTpM0CApKoMzBA5bkwek1vsRBEQuMdQ']) + ", { dataVaultUrl: 'https://data-vault.argo.colossi.network/api/v1/files'}, " + JSON.stringify(layout) + "); true;");        
    }   
    for(let control of ocaStructure.controls) {
      for (let credentialAttribute of credential.credentialAttributes) {
        if (credentialAttribute.name === control.name) {
          credentialAttribute.name = control.translations.fr.label;
        }
      }
    }
  })
  .catch(error => {
    console.log(error);
  });
*/
  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }
  
  const jscode = `
    window.hello = function() {
      alert('Hello from window.'); 
    };
    window.a = 5;
  `;

  const htmlcode = `
    <html>
      <body>
        <h2>Web view example</h2>
      </body>
    </html>
  `;
  //source={Platform.OS === 'android' ? { uri: 'file:///android_asset/test.html' } : require('../screens/index.html')}
  //source={{html: require('./html.js')()}} 
  //source={{html: htmlcode}}
  return (
    <Record2
      header={() => (<View style={{ height: 250 }}>
        <WebView
          automaticallyAdjustContentInsets={false}
          ref={webview}
          originWhitelist={["*"]}
          source={{html: require('./html.js')()}} 
          incognito={true}
          cacheEnabled={false}
          style={{backgroundColor:'#00000000'}}
          //injectedJavaScript={jscode} 
          onLoadEnd={()=>{webview?.current?.postMessage('Hello from RN');}} 
          domStorageEnabled={true}  
          javaScriptEnabled={true} 
          allowFileAccess={true} 
          allowUniversalAccessFromFileURLs={true} 
        />
      </View>)}
      footer={() => (
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.footerText, styles.link, { color: ColorPallet.semantic.error }]}>
              {t('CredentialDetails.RemoveFromWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      attributes={credential.credentialAttributes}
      hideAttributeValues={true}
    />
  )
}

export default CredentialDetails
