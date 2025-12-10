import type {
  TrustValidatorOptions,
  FieldRules,
  FormValidationResult,
  FieldValidationResult,
  ExtendedValidityState,
  ConstraintValidationMessages,
  StringRules,
  NumberRules,
  ArrayRules,
} from "./types/index";

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export default class TrustValidator {
  private form: HTMLFormElement;
  private options: TrustValidatorOptions;
  private fields: Record<string, FieldRules> = {};

  constructor(form: HTMLFormElement, options: TrustValidatorOptions = {}) {
    this.form = form;
    this.options = options;

    if (!options.suppressWarnings) this.checkFormStructure();
    if (options.autoBindEvents) this.autoBind();
  }

  addField(fieldName: string, rules: FieldRules): void {
    this.fields[fieldName] = rules;
    if (!this.options.suppressWarnings) this.warnRuleConflicts(fieldName, rules);
  }

  validate(): FormValidationResult {
    const result: FormValidationResult = { valid: true, fields: {} };
    for (const name in this.fields) {
      result.fields[name] = this.validateField(name);
      if (!result.fields[name].valid) result.valid = false;
    }
    return result;
  }

  validateField(fieldName: string): FieldValidationResult {
    const field = this.getField(fieldName);
    const rules = this.fields[fieldName];

    if (!field) {
      return {
        valid: false,
        errors: [`Поле "${fieldName}" не найдено`],
        validity: { builtIn: {} as ValidityState, customErrors: [], allErrors: [] },
      };
    }

    const builtInValidity = field.validity;
    const customErrors: string[] = [];
    const allErrors: string[] = [];

    const messages = this.resolveMessages();

    if (builtInValidity.valueMissing) allErrors.push(messages.valueMissing || "Поле обязательно");
    if (builtInValidity.typeMismatch) allErrors.push(messages.typeMismatch || "Неверный тип данных");
    if (builtInValidity.patternMismatch) allErrors.push(messages.patternMismatch || "Неверный формат");
    if (builtInValidity.tooShort) allErrors.push(messages.tooShort || "Слишком коротко");
    if (builtInValidity.tooLong) allErrors.push(messages.tooLong || "Слишком длинно");
    if (builtInValidity.rangeOverflow) allErrors.push(messages.rangeOverflow || "Слишком большое значение");
    if (builtInValidity.rangeUnderflow) allErrors.push(messages.rangeUnderflow || "Слишком маленькое значение");

    const value = this.getFieldValue(field);
    this.processJsRules(field, value, rules, customErrors);
    allErrors.push(...customErrors);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      validity: { builtIn: builtInValidity, customErrors, allErrors },
    };
  }

  getFieldValidity(field: FieldElement): ExtendedValidityState {
    return { builtIn: field.validity, customErrors: [], allErrors: [] };
  }

  checkFormStructure(): void {
    const inputs = this.form.querySelectorAll<FieldElement>("[name]");
    inputs.forEach((el) => {
      const name = el.getAttribute("name") || "";
      const id = el.id;
      if (id && !this.form.querySelector(`label[for="${id}"]`)) this.warn(`У поля "${name}" нет <label for>`);
      const errorSlot =
        el.parentElement?.querySelector<HTMLElement>(`.error-${name}`) ||
        this.form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      if (!errorSlot) this.warn(`У поля "${name}" нет места для вывода ошибок`);
    });
  }

  private getField(name: string): FieldElement | null {
    return this.form.querySelector<FieldElement>(`[name="${name}"]`);
  }

  private getFieldValue(field: FieldElement): string | number | string[] | null {
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      const group = Array.from(this.form.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${field.name}"]`));
      const checked = group.filter((el) => el.checked).map((el) => el.value);
      return checked.length > 0 ? checked : []; // всегда массив, даже если пустой
    }

    if (field instanceof HTMLInputElement && field.type === "number") {
      return field.value === "" ? null : parseFloat(field.value);
    }

    return field.value?.trim() || ""; // строки
  }

  private processJsRules(
    _field: FieldElement, 
    value: string | number | string[] | null, 
    rules: FieldRules, errors: string[]): void 
    {
    if (typeof value === "string") {
      const strRules = rules as StringRules;
      if (strRules.required && value.trim() === "") errors.push(this.getMessage(strRules.required, "Поле обязательно"));
      if (strRules.minLength && value.length < this.val(strRules.minLength))
        errors.push(this.getMessage(strRules.minLength, `Минимальная длина ${this.val(strRules.minLength)}`));
      if (strRules.maxLength && value.length > this.val(strRules.maxLength))
        errors.push(this.getMessage(strRules.maxLength, `Максимальная длина ${this.val(strRules.maxLength)}`));
      if (strRules.pattern && !this.regex(strRules.pattern).test(value)) errors.push(this.getMessage(strRules.pattern, "Неверный формат"));
      if (strRules.custom) {
        const res = strRules.custom(value);
        if (res !== true) errors.push(res);
      }
    }

    if (typeof value === "number") {
      const numRules = rules as NumberRules;
      if (numRules.required && (value === null || isNaN(value))) errors.push(this.getMessage(numRules.required, "Введите число"));
      if (numRules.min && value < this.val(numRules.min)) errors.push(this.getMessage(numRules.min, `Минимум ${this.val(numRules.min)}`));
      if (numRules.max && value > this.val(numRules.max)) errors.push(this.getMessage(numRules.max, `Максимум ${this.val(numRules.max)}`));
      if (numRules.custom) {
        const res = numRules.custom(value);
        if (res !== true) errors.push(res);
      }
    }

    if (Array.isArray(value)) {
      const arrRules = rules as ArrayRules;
      if (arrRules.required && value.length === 0) errors.push("Выберите хотя бы один вариант");
      if (arrRules.arrayMin && value.length < this.val(arrRules.arrayMin))
        errors.push(`Минимум ${this.val(arrRules.arrayMin)} вариантов`);
      if (arrRules.arrayMax && value.length > this.val(arrRules.arrayMax))
        errors.push(`Максимум ${this.val(arrRules.arrayMax)} вариантов`);
      if (arrRules.custom) {
        const res = arrRules.custom(value);
        if (res !== true) errors.push(res);
      }
    }
  }

  private autoBind(): void {
    for (const name in this.fields) {
      const field = this.getField(name);
      if (!field) continue;
      field.addEventListener("input", () => this.validateAndRender(name));
      field.addEventListener("blur", () => this.validateAndRender(name));
    }
  }

  private validateAndRender(name: string): void {
    const result = this.validateField(name);
    const field = this.getField(name);
    const errorSlot =
      field?.parentElement?.querySelector<HTMLElement>(`.error-${name}`) ||
      this.form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (errorSlot) errorSlot.textContent = result.errors.join(", ");
  }

  private warn(message: string): void {
    const event = new CustomEvent("trustvalidator:warning", { detail: { message } });
    this.form.dispatchEvent(event);
  }

  private warnRuleConflicts(name: string, rules: FieldRules) {
    const field = this.getField(name);
    if (!field) return;
    if ("minLength" in rules && field.getAttribute("minlength")) this.warn(`JS minLength и HTML minlength одновременно у поля "${name}"`);
    if ("pattern" in rules && field.getAttribute("pattern")) this.warn(`JS pattern и HTML pattern одновременно у поля "${name}"`);
  }

  private resolveMessages(): ConstraintValidationMessages {
    return {
      valueMissing: "Поле обязательно",
      typeMismatch: "Неверный тип данных",
      patternMismatch: "Неверный формат",
      tooShort: "Слишком коротко",
      tooLong: "Слишком длинно",
      rangeOverflow: "Слишком большое значение",
      rangeUnderflow: "Слишком маленькое значение",
      customError: "Ошибка проверки",
      ...(this.options.messages || {}),
    };
  }

  private getMessage(
    rule: boolean | string | number | RegExp | { value?: string | number | RegExp; message?: string },
    defaultMessage: string
  ): string {
    if (typeof rule === "string") return rule;
    if (typeof rule === "boolean") return defaultMessage;
    if (typeof rule === "number") return defaultMessage;
    if (rule instanceof RegExp) return defaultMessage;
    if (typeof rule === "object" && rule.message) return rule.message;
    return defaultMessage;
  }

  private val(rule: number | { value: number; message?: string }): number {
    return typeof rule === "object" ? rule.value : rule;
  }

  private regex(rule: RegExp | { value: RegExp; message?: string }): RegExp {
    return rule instanceof RegExp ? rule : rule.value;
  }
}
