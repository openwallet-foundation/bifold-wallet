import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { getProofRequestTemplates,AnonCredsProofRequestTemplatePayload,ProofRequestTemplate ,ProofRequestType} from '@hyperledger/aries-bifold-verifier';
import { AnonCredsProofRequestRestriction, AnonCredsRequestedPredicate,AnonCredsRequestedAttribute } from '@credo-ts/anoncreds';
import { ColorPallet, TextTheme } from '../theme'
interface ProofRequestTemplateBuilderProps {
  onSaveTemplate: (template: ProofRequestTemplate) => void;
}

export const ProofRequestTemplateBuilder: React.FC<ProofRequestTemplateBuilderProps> = ({ 
  onSaveTemplate, 
}) => {

  const initialTemplate: ProofRequestTemplate = {
    id: '',
    name: 'Student verification',
    description: 'Verify student credentials',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.AnonCreds,
      data: [
        {
          schema: '',
          requestedAttributes: [],
          requestedPredicates: []
        },
      ],
    },
  };
 interface ProofRequestTemplate {
  id: string
  name: string
  description: string
  version: string
  devOnly?: boolean
  payload: AnonCredsProofRequestTemplatePayload 
}
  const [template, setTemplate] = useState<ProofRequestTemplate>(initialTemplate);
  const [availableAttributes, setAvailableAttributes] = useState<AnonCredsRequestedAttribute[]>([]);
  const [availablePredicates, setAvailablePredicates] = useState<AnonCredsRequestedPredicate[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedPredicate, setSelectedPredicate] = useState<string>();
  const [predicateType, setPredicateType] = useState<'>=' | '>' | '<=' | '<'>('>=');
  const [predicateValue, setPredicateValue] = useState('');
  const [groupedAttributes, setGroupedAttributes] = useState(false);
  const [selectedGroupAttributes, setSelectedGroupAttributes] = useState<string[]>([]);
  const [usedAttributes, setUsedAttributes] = useState<string[]>([]);
  const [usedPredicates, setUsedPredicates] = useState<string[]>([]);
  const [availableSchemas, setAvailableSchemas] = useState<string[]>([]);
  const [availableRestrictions, setAvailableRestrictions] = useState<AnonCredsProofRequestRestriction[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [customCredDefId, setCustomCredDefId] = useState('');
  const [useRestrictions, setUseRestrictions] = useState(true);

  useEffect(() => {
    const extractSchemaInfo = () => {
      const templates = getProofRequestTemplates(true);
      
      if (!templates || templates.length === 0) {
        console.warn('No templates available to extract schema information');
        return;
      }
  
      const extractedAttributes = new Set();
      const extractedPredicates = new Map();
      const extractedSchemas = new Set();
      const extractedRestrictions = new Map();
      templates.forEach(template => {
        if (template.payload?.type == ProofRequestType.DIF) return;  //The custom template is not ready for DIF 
        
        template.payload.data.forEach(dataItem => {
          if (dataItem.schema) {
            extractedSchemas.add(dataItem.schema);
          }
          
          if (dataItem.requestedAttributes) {
            dataItem.requestedAttributes.forEach(attr => {
              if (attr.name) {
                extractedAttributes.add(attr.name);
              } else if (attr.names) {
                attr.names.forEach(name => extractedAttributes.add(name));
              }
              if(attr.restrictions) {
                attr.restrictions.forEach(restriction => {
                  if (restriction) {
                    extractedRestrictions.set(restriction.schema_name, restriction);
                  }
                });
              }
            });
          }
          
          if (dataItem.requestedPredicates) {
            dataItem.requestedPredicates.forEach(pred => {
              if (pred.name) {
                extractedPredicates.set(pred.name, {
                  name: pred.name,
                  description: pred.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                });
              }
            });
          }
        });
      });
  
      const schemasList = Array.from(extractedSchemas);
      setAvailableSchemas(schemasList as string[]);
      setSelectedSchema(schemasList.length > 0 ? schemasList[0] as string: "");
      setAvailableAttributes(Array.from(extractedAttributes) as AnonCredsRequestedAttribute[]);
      setAvailablePredicates(Array.from(extractedPredicates.values()));
      setAvailableRestrictions(Array.from(extractedRestrictions.values()) as AnonCredsProofRequestRestriction[]);
      if (schemasList.length > 0) {
        updateTemplateSchema(schemasList[0] as string);
      }
    };
    extractSchemaInfo();
  }, []);


  
  const updateTemplateSchema = (schema: string) => {
    setTemplate(prevTemplate => {
   
      const updatedTemplate = { ...prevTemplate };
        updatedTemplate.payload.data[0].schema = schema;
    
      return updatedTemplate;
    });
  };

  const getRestrictions = () => {
    if (customCredDefId.trim()) {
      return [{ cred_def_id: customCredDefId.trim() }];
    } else if (useRestrictions && availableRestrictions.length > 0) {
      return availableRestrictions;
    }
  };

  const isAttributeUsed = (attributeName:string) => {
    return usedAttributes.includes(attributeName);
  };

  const isPredicateUsed = (predicateName:string) => {
    return usedPredicates.includes(predicateName);
  };

  const isUsedInPredicate = (attributeName:string) => {
    return usedPredicates.includes(attributeName);
  };

  const isAttributeDisabled = (attributeName:string) => {
    return isAttributeUsed(attributeName) || isUsedInPredicate(attributeName);
  };

  const isPredicateDisabled = (predicateName:string) => {
    return isPredicateUsed(predicateName) || isAttributeUsed(predicateName);
  };

  const toggleAttributeSelection = (attributeName:string) => {
    if (isAttributeDisabled(attributeName)) {
      if (isUsedInPredicate(attributeName)) {
        Alert.alert('Already Used in Predicate', `The attribute "${attributeName}" is already being used as a predicate in this template.`);
      } else {
        Alert.alert('Already Added', `The attribute "${attributeName}" is already being used in this template.`);
      }
      return;
    }

    if (groupedAttributes) {
      const newSelection = [...selectedGroupAttributes];
      const index = newSelection.indexOf(attributeName);
      
      if (index === -1) {
        newSelection.push(attributeName);
      } else {
        newSelection.splice(index, 1);
      }
      
      setSelectedGroupAttributes(newSelection);
    } else {
      const newSelection = [...selectedAttributes];
      const index = newSelection.indexOf(attributeName);
      
      if (index === -1) {
        newSelection.push(attributeName);
      } else {
        newSelection.splice(index, 1);
      }
      
      setSelectedAttributes(newSelection);
    }
  };

  const addSelectedAttributes = () => {
    if (groupedAttributes) {
      if (selectedGroupAttributes.length < 2) {
        Alert.alert('Validation Error', 'You need at least 2 attribute names for grouping');
        return;
      }

      const updatedTemplate = { ...template };
      const restrictions = getRestrictions();
      const newAttr = {
        names: [...selectedGroupAttributes],
        restrictions: restrictions ? restrictions : [],
 
      };
    
        updatedTemplate.payload.data[0].requestedAttributes?.push(newAttr);

      setTemplate(updatedTemplate);
      setUsedAttributes([...usedAttributes, ...selectedGroupAttributes]);
      setSelectedGroupAttributes([]);
    } else {
      if (selectedAttributes.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one attribute');
        return;
      }

      const updatedTemplate = { ...template };

      const restrictions = getRestrictions();
      
      selectedAttributes.forEach(attrName => {
        const newAttr = {
          name: attrName,
          restrictions: restrictions ? restrictions : [],
        };
        
        
          updatedTemplate.payload.data[0].requestedAttributes?.push(newAttr);
        
      });

      setTemplate(updatedTemplate);
      setUsedAttributes([...usedAttributes, ...selectedAttributes]);
      setSelectedAttributes([]);
    }
  };

  const addSelectedPredicate = () => {
    if (!selectedPredicate) {
      Alert.alert('Validation Error', 'Please select a predicate');
      return;
    }

    if (!predicateValue.trim() || isNaN(parseInt(predicateValue, 10))) {
      Alert.alert('Validation Error', 'Predicate value must be a valid number');
      return;
    }

    const updatedTemplate = { ...template };
    const restrictions = getRestrictions();
    
    const newPredicate = {
      name: selectedPredicate,
      predicateType: predicateType,
      predicateValue: parseInt(predicateValue, 10),
      restrictions: restrictions ? restrictions : [],
    };

    updatedTemplate.payload.data[0].requestedPredicates?.push(newPredicate);

    setTemplate(updatedTemplate);
    setUsedPredicates([...usedPredicates, selectedPredicate]);
    setSelectedPredicate(undefined);
    setPredicateValue('');
  };

  const removeAttribute = (index: number) => {
    const updatedTemplate = { ...template };
    const attributeToRemove = updatedTemplate.payload.data[0].requestedAttributes?.[index];
    
    let attributesToRemove: string | string[] = [];
    if (attributeToRemove?.name) {
      attributesToRemove = [attributeToRemove.name];
    } else if (attributeToRemove?.names) {
      attributesToRemove = [...attributeToRemove.names];
    }
    
    const updatedUsedAttributes = usedAttributes.filter(attr => !attributesToRemove.includes(attr));
    setUsedAttributes(updatedUsedAttributes);
    
    updatedTemplate.payload.data[0].requestedAttributes?.splice(index, 1);
    setTemplate(updatedTemplate);
  };

  const removePredicate = (index: number) => {
    const updatedTemplate = { ...template };
    const predicateToRemove = updatedTemplate.payload.data[0].requestedPredicates?.[index];
    
    const updatedUsedPredicates = usedPredicates.filter(pred => pred !== predicateToRemove?.name);
    setUsedPredicates(updatedUsedPredicates);
    
    updatedTemplate.payload.data[0].requestedPredicates?.splice(index, 1);
    setTemplate(updatedTemplate);
  };

  const generateTemplateId = () => {
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `GzqVMWH2foFz3NqMuwHH7a:3:CL:${Date.now()}:${randomPart}`;
  };

  const saveTemplate = () => {
    if (!template.name.trim() || !template.description.trim()) {
      Alert.alert('Validation Error', 'Template name and description are required');
      return;
    }

    if (template.payload.data[0].requestedAttributes?.length === 0 && 
        template.payload.data[0].requestedPredicates?.length === 0) {
      Alert.alert('Validation Error', 'You must add at least one attribute or predicate');
      return;
    }

    const finalTemplate = {
      ...template,
      id: template.id || generateTemplateId()
    };
    
    onSaveTemplate(finalTemplate);
    setTemplate(initialTemplate);
    setSelectedAttributes([]);
    setSelectedGroupAttributes([]);
    setSelectedPredicate(undefined);
    setPredicateValue('');
    setUsedAttributes([]);
    setUsedPredicates([]);
    setCustomCredDefId('');
    setUseRestrictions(true);
    Alert.alert('Success', 'Proof request generated successfully');
  };

  interface AttributeRadioItemProps {
    name: string;
    selected: boolean;
    onSelect: (name: string) => void;
    disabled: boolean;
    disabledReason: string;
  }

  const AttributeRadioItem: React.FC<AttributeRadioItemProps> = ({ name, selected, onSelect, disabled, disabledReason }) => (
    <TouchableOpacity
      style={[styles.radioItem, disabled && styles.radioItemDisabled]}
      onPress={() => !disabled && onSelect(name)}
      disabled={disabled}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected, disabled && styles.radioCircleDisabled]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.radioText, disabled && styles.radioTextDisabled]}>
        {name} {disabled ? `(${disabledReason})` : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Basic Template Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Template Information</Text>
        
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={template.name}
          onChangeText={(text: string) => setTemplate({...template, name: text})}
          placeholder="e.g., Student verification"
        />
        
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.textArea}
          value={template.description}
          onChangeText={(text: string) => setTemplate({...template, description: text})}
          placeholder="Describe what this template verifies"
          multiline
        />
        
        <Text style={styles.label}>Version:</Text>
        <TextInput
          style={styles.input}
          value={template.version}
          onChangeText={(text: string) => setTemplate({...template, version: text})}
          placeholder="e.g., 0.0.1"
        />
        
        {/* Schema Selection */}
        <View style={styles.schemaSelector}>
          <Text style={styles.label}>Select Schema:</Text>
          <ScrollView style={styles.schemaList} horizontal={false}>
            {availableSchemas.map((schema) => (
              <TouchableOpacity
                key={schema}
                style={[styles.schemaItem, selectedSchema === schema && styles.schemaItemSelected]}
                onPress={() => {
                  setSelectedSchema(schema);
                  updateTemplateSchema(schema);
                }}
              >
                <Text style={[styles.schemaText, selectedSchema === schema && styles.schemaTextSelected]}>
                  {schema}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Credential Definition ID Input */}
        <Text style={styles.label}>Credential Definition ID:</Text>
        <TextInput
          style={styles.input}
          value={customCredDefId}
          onChangeText={setCustomCredDefId}
          placeholder="Enter cred_def_id (optional)"
        />
        
        {/* Use Restrictions Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Use Default Restrictions:</Text>
          <Switch 
            value={useRestrictions} 
            onValueChange={setUseRestrictions}
            disabled={!!customCredDefId.trim()}
          />
          {customCredDefId.trim() && (
            <Text style={styles.infoText}>
              (Custom cred_def_id takes precedence)
            </Text>
          )}
        </View>
      </View>
      
      {/* Requested Attributes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requested Attributes</Text>
        
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Group Attributes:</Text>
          <Switch 
            value={groupedAttributes} 
            onValueChange={(value: boolean) => {
              setGroupedAttributes(value);
              setSelectedAttributes([]);
              setSelectedGroupAttributes([]);
            }} 
          />
        </View>
        
        <Text style={styles.label}>
          {groupedAttributes ? 'Select Multiple Attributes (min 2):' : 'Select Attributes:'}
        </Text>
        
        <View style={styles.attributesList}>
          {availableAttributes.map((attr) => (
            <AttributeRadioItem
              key={attr as string}
              name={attr as string}
              selected={groupedAttributes ? selectedGroupAttributes.includes(attr as string) : selectedAttributes.includes(attr as string)}
              onSelect={toggleAttributeSelection}
              disabled={isAttributeDisabled(attr as string)}
              disabledReason={isUsedInPredicate(attr as string) ? 'used in predicate' : 'already added'}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, (groupedAttributes ? selectedGroupAttributes.length < 2 : selectedAttributes.length === 0) && styles.buttonDisabled]} 
          onPress={addSelectedAttributes}
          disabled={groupedAttributes ? selectedGroupAttributes.length < 2 : selectedAttributes.length === 0}
        >
          <Text style={styles.buttonText}>
            {groupedAttributes ? 'Add Grouped Attributes' : 'Add Selected Attributes'}
          </Text>
        </TouchableOpacity>
        
        {/* Display Current Attributes */}
        {template.payload.data[0].requestedAttributes && template.payload.data[0].requestedAttributes.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.label}>Current Attributes:</Text>
            {template.payload.data[0].requestedAttributes?.map((attr, index) => (
              <View key={index} style={styles.listItem}>
                <Text>
                  {attr.name ? `Single: ${attr.name}` : `Group: ${attr.names?.join(', ')}`}
                  {attr.restrictions ? ' (with restrictions)' : ' (no restrictions)'}
                </Text>
                <TouchableOpacity onPress={() => removeAttribute(index)}>
                  <Text style={styles.deleteButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Requested Predicates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requested Predicates</Text>
        
        <Text style={styles.label}>Select Predicate:</Text>
        <View style={styles.attributesList}>
          {availablePredicates.map((pred) => (
            <AttributeRadioItem
              key={pred.name}
              name={`${pred.name}`}
              selected={selectedPredicate === pred.name}
              onSelect={() => setSelectedPredicate(pred.name)}
              disabled={isPredicateDisabled(pred.name)}
              disabledReason={isPredicateUsed(pred.name) ? 'already added' : 'used as attribute'}
            />
          ))}
        </View>
        
        <Text style={styles.label}>Predicate Type:</Text>
        <View style={styles.pickerContainer}>
          {['>=', '>', '<=', '<'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.pickerItem, predicateType === type && styles.pickerItemSelected]}
              onPress={() => setPredicateType(type as '>=' | '>' | '<=' | '<')}
            >
              <Text style={predicateType === type ? styles.pickerTextSelected : null}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Predicate Value:</Text>
        <TextInput
          style={styles.input}
          value={predicateValue}
          onChangeText={setPredicateValue}
          placeholder="e.g., 20240101"
          keyboardType="numeric"
        />
        
        <TouchableOpacity 
          style={[styles.button, (!selectedPredicate || isPredicateDisabled(selectedPredicate)) && styles.buttonDisabled]} 
          onPress={addSelectedPredicate}
          disabled={!selectedPredicate || isPredicateDisabled(selectedPredicate)}
        >
          <Text style={styles.buttonText}>Add Predicate</Text>
        </TouchableOpacity>
        
        {/* Display Current Predicates */}
        {template.payload.data[0].requestedPredicates && template.payload.data[0].requestedPredicates.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.label}>Current Predicates:</Text>
            {template.payload.data[0].requestedPredicates?.map((pred, index) => (
              <View key={index} style={styles.listItem}>
                <Text>
                  {`${pred.name} ${pred.predicateType} ${pred.predicateValue}`}
                  {pred.restrictions ? ' (with restrictions)' : ' (no restrictions)'}
                </Text>
                <TouchableOpacity onPress={() => removePredicate(index)}>
                  <Text style={styles.deleteButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Generate Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTemplate}>
        <Text style={styles.buttonText}>Generate Proof Request</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: ColorPallet.grayscale.white,
  },
  section: {
    backgroundColor: ColorPallet.grayscale.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...TextTheme.headingFour,
    color: ColorPallet.grayscale.black,
    marginBottom: 20,
  },
  label: {
    ...TextTheme.normal,
    color: ColorPallet.grayscale.black,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: ColorPallet.grayscale.lightGrey,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: ColorPallet.grayscale.veryLightGrey ,
    color: ColorPallet.grayscale.black,
  },
  textArea: {
    borderWidth: 1,
    borderColor: ColorPallet.grayscale.lightGrey,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
    color: ColorPallet.grayscale.black,
  },
  button: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  saveButton: {
    backgroundColor: ColorPallet.brand.primary,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    ...TextTheme.bold,
    color: ColorPallet.grayscale.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: ColorPallet.grayscale.mediumGrey,
    marginLeft: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pickerItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    borderRadius: 4,
  },
  pickerItemSelected: {
    backgroundColor: ColorPallet.brand.primary,
  },
  pickerTextSelected: {
    color: ColorPallet.grayscale.white,
  },
  listContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  deleteButton: {
    color: '#F44336',
  },
  attributesList: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioItemDisabled: {
    opacity: 0.5,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: ColorPallet.brand.primary,
  },
  radioCircleDisabled: {
    borderColor: ColorPallet.brand.primaryDisabled,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: ColorPallet.brand.primary
  },
  radioText: {
    fontSize: 16,
    color: ColorPallet.grayscale.black
  },
  radioTextDisabled: {
    color: ColorPallet.brand.primaryDisabled,
  },
  schemaSelector: {
    marginBottom: 16,
  },
  schemaList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: ColorPallet.grayscale.lightGrey,
    borderRadius: 4,
    padding: 8,
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
  },
  schemaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  schemaItemSelected: {
    backgroundColor: ColorPallet.brand.primary,
  },
  schemaText: {
    fontSize: 14,
    color: ColorPallet.grayscale.black,
  },
  schemaTextSelected: {
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
  }
});