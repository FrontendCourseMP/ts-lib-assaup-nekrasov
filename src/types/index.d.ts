export type TrustValidatorInit = HTMLFormElement

export interface TrustValidatorOptions {
  suppressWarnings?: boolean
}

export interface TrustValidatorConstructor {
  new (
    form: TrustValidatorInit,
    options?: TrustValidatorOptions
  ): TrustValidatorInstance
}

export interface FieldRules {
  [rule: string]: unknown
}

export interface AddField {
  (name: string, rules: FieldRules): void
}

export interface ValidateResult {
  valid: boolean
  errors: Record<string, string[]>
}

export interface Validate {
  (): ValidateResult
}

export interface WarningEntry {
  field: string
  rule: string
  htmlValue: unknown
  jsValue: unknown
}

export interface TrustValidatorInstance {
  form: HTMLFormElement
  fields: Map<string, FieldRules>
  options: TrustValidatorOptions
  warnings: WarningEntry[]
  addField: AddField
  validate: Validate
}

export interface ValidityObject extends ValidityState {}

export const TrustValidator: TrustValidatorConstructor
