import TrustValidator from './app';

const form = document.getElementById('demoForm') as HTMLFormElement;
const resultContainer = document.getElementById('formResult') as HTMLElement;
const warnContainer = document.getElementById('formWarnings') as HTMLElement;

const validator = new TrustValidator(form, { autoBindEvents: true });

// Добавляем правила
validator.addField('username', { required: true, minLength: 3 });
validator.addField('email', { 
  required: true,
  pattern: /^[\w.-]+@[\w.-]+\.\w+$/, 
});
validator.addField('age', { min: 0, max: 99 });
validator.addField('options', { 
    arrayMin: 1,
    required: true,
});
validator.addField('password', { 
  required: true, 
  minLength: 6, 
  custom: (value:string) => /[A-Z]/.test(value) || 'Пароль должен содержать хотя бы одну заглавную букву'
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const result = validator.validate();

  resultContainer.textContent = '';
  warnContainer.textContent = '';

  if (!result.valid) {
    for (const fieldName in result.fields) {
      const fieldResult = result.fields[fieldName];
      if (!fieldResult.valid) {
        const div = document.createElement('div');
        div.textContent = `Поле "${fieldName}": ${fieldResult.errors.join(', ')}`;
        div.style.color = 'red';
        resultContainer.appendChild(div);
      }
    }
    return; // блокируем отправку формы
  }

  // форма валидна
  resultContainer.textContent = "Форма валидна";
});

// Прослушивание предупреждений
form.addEventListener('trustvalidator:warning', (e: Event) => {
  const detail = (e as CustomEvent).detail;
  const div = document.createElement('div');
  div.textContent = `Warning: ${detail.message}`;
  div.style.color = 'orange';
  warnContainer.appendChild(div);
});
