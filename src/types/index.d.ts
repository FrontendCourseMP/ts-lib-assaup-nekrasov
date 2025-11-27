export type TrustValidatorInit = HTMLFormElement

export interface TrustValidatorConstructor {
  new (form: TrustValidatorInit): TrustValidatorInstance
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

export interface TrustValidatorInstance {
  form: HTMLFormElement
  fields: Map<string, FieldRules>
  addField: AddField
  validate: Validate
}

export interface ValidityObject extends ValidityState {}

export const TrustValidator: TrustValidatorConstructor
