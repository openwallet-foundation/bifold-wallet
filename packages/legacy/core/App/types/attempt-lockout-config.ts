export type AttemptLockoutConfig = {
  baseRules: Record<number, number | undefined>
  baseRulesIncrement: number
  threshold: number
  thresholdPenaltyDuration: number
}
