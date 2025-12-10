import { describe, it, expect } from 'vitest';
import TrustValidator from '../main';

describe('TrustValidator', () => {
  it('валидирует обязательное текстовое поле', () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="text" name="username" />
      </form>
    `;

    const form = document.getElementById('form') as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField('username', { required: true });

    const resultEmpty = validator.validate();
    expect(resultEmpty.valid).toBe(false);
    expect(resultEmpty.fields.username.errors).toContain('Поле обязательно');

    const input = form.querySelector<HTMLInputElement>('input[name="username"]')!;
    input.value = 'John';

    const resultFilled = validator.validate();
    expect(resultFilled.valid).toBe(true);
  });

  it('валидирует числовое поле min/max', () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="number" name="age" />
      </form>
    `;

    const form = document.getElementById('form') as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField('age', { min: 18, max: 99 });

    const input = form.querySelector<HTMLInputElement>('input[name="age"]')!;
    input.value = '10';
    let result = validator.validate();
    expect(result.valid).toBe(false);

    input.value = '50';
    result = validator.validate();
    expect(result.valid).toBe(true);

    input.value = '120';
    result = validator.validate();
    expect(result.valid).toBe(false);
  });

  it('валидирует чекбоксы (массив)', () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="checkbox" name="options" value="a" />
        <input type="checkbox" name="options" value="b" />
      </form>
    `;

    const form = document.getElementById('form') as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField('options', { arrayMin: 1 });

    let result = validator.validate();
    expect(result.valid).toBe(false);

    const checkbox = form.querySelector<HTMLInputElement>('input[name="options"][value="a"]')!;
    checkbox.checked = true;

    result = validator.validate();
    expect(result.valid).toBe(true);
  });

  it('валидирует кастомные функции', () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="text" name="password" />
      </form>
    `;

    const form = document.getElementById('form') as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField('password', {
      custom: (value: string) => /[A-Z]/.test(value) || 'Должна быть заглавная буква'
    });

    const input = form.querySelector<HTMLInputElement>('input[name="password"]')!;
    input.value = 'abc';
    let result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.fields.password.errors).toContain('Должна быть заглавная буква');

    input.value = 'Abc';
    result = validator.validate();
    expect(result.valid).toBe(true);
  });
});
