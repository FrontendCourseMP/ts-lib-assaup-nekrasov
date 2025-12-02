import type { TrustValidatorInit, FieldRules, ValidateResult } from './types'

class TrustValidator {
  form: HTMLFormElement
  fields: Map<string, FieldRules>

  constructor(form: TrustValidatorInit) {
    this.form = form
    this.fields = new Map()
  }

  addField(name: string, rules: FieldRules): void {
    const field = this.form.elements.namedItem(name)
    
    if (!field) {
      return
    }

    const input = field as HTMLInputElement
    const label = this.form.querySelector(`label[for="${input.id}"]`)
    const errorElement = this.form.querySelector(`[data-error="${name}"]`)

    if (!label) {
      // Label check placeholder
    }

    if (!errorElement) {
      // Error element check placeholder  
    }

    this.fields.set(name, rules)
  }

  validate(): ValidateResult {
    const errors: Record<string, string[]> = {}
    let valid = true

    for (const [name, rules] of this.fields) {
      const field = this.form.elements.namedItem(name) as HTMLInputElement
      const fieldErrors: string[] = []

      if (!field) continue

      const value = field.type === 'checkbox' 
        ? Array.from(this.form.querySelectorAll(`[name="${name}"]:checked`))
            .map((el: Element) => (el as HTMLInputElement).value)
        : field.value

      for (const [rule, ruleValue] of Object.entries(rules)) {
        const isValid = this.checkValidity(rule, ruleValue, value)
        
        if (!isValid) {
          fieldErrors.push(this.getErrorMessage(rule, ruleValue))
          valid = false
        }
      }

      if (fieldErrors.length > 0) {
        errors[name] = fieldErrors
      }
    }

    return { valid, errors }
  }

  private checkValidity(rule: string, ruleValue: unknown, value: string | string[]): boolean {
    switch (rule) {
      case 'required':
        return !ruleValue || (Array.isArray(value) ? value.length > 0 : value.trim() !== '')
      
      case 'minLength':
        return typeof value === 'string' && value.length >= (ruleValue as number)
      
      case 'pattern':
        return typeof value === 'string' && new RegExp(ruleValue as string).test(value)
      
      default:
        return true
    }
  }

  private getErrorMessage(rule: string, ruleValue: unknown): string {
    const customMessage = typeof ruleValue === 'object' && ruleValue !== null 
      ? (ruleValue as { message?: string }).message 
      : null

    if (customMessage) return customMessage

    switch (rule) {
      case 'required':
        return 'This field is required'
      case 'minLength':
        return `Minimum length is ${ruleValue}`
      case 'pattern':
        return 'Invalid format'
      default:
        return 'Invalid value'
    }
  }
}

export default TrustValidator