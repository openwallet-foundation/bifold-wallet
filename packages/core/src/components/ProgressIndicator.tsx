/**
 * Progress Indicator Component
 * 
 * Displays a multi-step progress indicator for onboarding, backup, restore,
 * and migration flows.
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native'
import { useTheme } from '../contexts/theme'

export type StepStatus = 'pending' | 'in-progress' | 'complete' | 'error'

export interface Step {
  /** Step label */
  label: string
  /** Step status */
  status: StepStatus
  /** Optional error message */
  errorMessage?: string
}

export interface ProgressIndicatorProps {
  /** Array of steps */
  steps: Step[]
  /** Current step index (0-based) */
  currentStep: number
  /** Show step numbers */
  showNumbers?: boolean
  /** Compact mode (smaller) */
  compact?: boolean
}

/**
 * ProgressIndicator Component
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  showNumbers = true,
  compact = false,
}) => {
  const { ColorPalette, TextTheme } = useTheme()

  const getStepColor = (status: StepStatus): string => {
    switch (status) {
      case 'pending':
        return ColorPalette.grayscale.lightGrey
      case 'in-progress':
        return ColorPalette.brand.primary
      case 'complete':
        return ColorPalette.notification.success
      case 'error':
        return ColorPalette.notification.error
    }
  }

  const getStepIcon = (status: StepStatus, index: number): string => {
    switch (status) {
      case 'pending':
        return showNumbers ? `${index + 1}` : '○'
      case 'in-progress':
        return '◐'
      case 'complete':
        return '✓'
      case 'error':
        return '✕'
    }
  }

  const styles = StyleSheet.create({
    container: {
      paddingVertical: compact ? 12 : 20,
      paddingHorizontal: compact ? 8 : 16,
    },
    stepsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepContainer: {
      flex: 1,
      alignItems: 'center',
    },
    stepCircle: {
      width: compact ? 32 : 40,
      height: compact ? 32 : 40,
      borderRadius: compact ? 16 : 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    stepIcon: {
      ...TextTheme.bold,
      fontSize: compact ? 14 : 16,
      color: ColorPalette.brand.primaryBackground,
    },
    stepLabel: {
      ...TextTheme.normal,
      fontSize: compact ? 10 : 12,
      marginTop: 8,
      textAlign: 'center',
      color: ColorPalette.grayscale.mediumGrey,
    },
    stepLabelActive: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primary,
    },
    stepLabelComplete: {
      color: ColorPalette.notification.success,
    },
    stepLabelError: {
      color: ColorPalette.notification.error,
    },
    connector: {
      height: 2,
      flex: 1,
      marginHorizontal: 4,
      marginBottom: compact ? 24 : 32,
    },
    errorMessage: {
      ...TextTheme.normal,
      fontSize: 12,
      color: ColorPalette.notification.errorText,
      marginTop: 4,
      textAlign: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: getStepColor(step.status),
                    borderColor: getStepColor(step.status),
                  },
                ]}
              >
                <Text style={styles.stepIcon}>
                  {getStepIcon(step.status, index)}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step.status === 'in-progress' && styles.stepLabelActive,
                  step.status === 'complete' && styles.stepLabelComplete,
                  step.status === 'error' && styles.stepLabelError,
                ]}
              >
                {step.label}
              </Text>
              {step.status === 'error' && step.errorMessage && (
                <Text style={styles.errorMessage}>{step.errorMessage}</Text>
              )}
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor:
                      step.status === 'complete'
                        ? ColorPalette.notification.success
                        : ColorPalette.grayscale.lightGrey,
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

/**
 * Helper function to create steps array
 */
export function createSteps(
  labels: string[],
  currentStep: number,
  errorStep?: number
): Step[] {
  return labels.map((label, index) => {
    let status: StepStatus = 'pending'

    if (index < currentStep) {
      status = 'complete'
    } else if (index === currentStep) {
      status = errorStep === index ? 'error' : 'in-progress'
    }

    return { label, status }
  })
}
