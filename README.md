# Документация

## Название команды: ts-lib-assaup-nekrasov

## Участники:

* Ассауп Самир Кайратович - assaup
* Некрасов Алексей Олегович - nelexey

---

# TrustValidator — библиотека валидации HTML-форм

**TrustValidator** — это библиотека для валидации HTML-форм на базе
**HTML Constraint Validation API + JavaScript-правил**, написанная на TypeScript.

Библиотека ориентирована на **прямую работу с DOM**, минимальную конфигурацию
и удобное расширение правил.

## Основные возможности

* **Нативная работа с HTML-формами**
* **Поддержка HTML5 validity (`required`, `pattern`, `min`, `max` и др.)**
* **JavaScript-правила валидации**
* **Поддержка строк, чисел и массивов (checkbox-группы)**
* **Кастомные правила**
* **Автоматический рендер ошибок**
* **Система предупреждений (warnings)**
* **Полная типизация (TypeScript)**

---

## Архитектура

TrustValidator использует **двухуровневую валидацию**:

1. **HTML-встроенная валидация**

   * `required`
   * `pattern`
   * `min / max`
   * `minlength / maxlength`

2. **JavaScript-валидация**

   * Строковые правила
   * Числовые правила
   * Правила для массивов
   * Кастомные функции

Все ошибки собираются в единый результат.

---

## Конструктор

```ts
new TrustValidator(form: HTMLFormElement, options?: TrustValidatorOptions)
```

### Опции

| Опция              | Тип       | Описание                                      |
| ------------------ | --------- | --------------------------------------------- |
| `autoBindEvents`   | `boolean` | Автоматическая валидация при `input` и `blur` |
| `suppressWarnings` | `boolean` | Отключение предупреждений                     |
| `messages`         | `object`  | Переопределение стандартных сообщений         |

---

## Добавление поля

```ts
validator.addField(fieldName: string, rules: FieldRules)
```

Пример:

```ts
validator.addField('username', {
  required: true,
  minLength: 3
});
```

---

## Доступные правила валидации

### Строковые правила

| Правило     | Описание                  |
| ----------- | ------------------------- |
| `required`  | Обязательное поле         |
| `minLength` | Минимальная длина строки  |
| `maxLength` | Максимальная длина строки |
| `pattern`   | Проверка по RegExp        |
| `custom`    | Кастомная функция         |

```ts
validator.addField('password', {
  required: true,
  minLength: 6,
  custom: (value) =>
    /[A-Z]/.test(value) || 'Пароль должен содержать заглавную букву'
});
```

---

### Числовые правила

| Правило    | Описание              |
| ---------- | --------------------- |
| `required` | Обязательное число    |
| `min`      | Минимальное значение  |
| `max`      | Максимальное значение |
| `custom`   | Кастомная проверка    |

```ts
validator.addField('age', {
  min: 0,
  max: 99
});
```

---

### Правила для массивов (checkbox)

| Правило    | Описание            |
| ---------- | ------------------- |
| `required` | Хотя бы один выбран |
| `arrayMin` | Минимум элементов   |
| `arrayMax` | Максимум элементов  |
| `custom`   | Кастомная проверка  |

```ts
validator.addField('options', {
  arrayMin: 1
});
```

---

## Кастомные правила

Кастомное правило должно вернуть:

* `true` — если поле валидно
* `string` — сообщение об ошибке

```ts
custom: (value) => {
  if (value === 'admin') return 'Недопустимое значение';
  return true;
}
```

---

## Валидация формы

```ts
const result = validator.validate();
```

### Результат валидации

```ts
{
  valid: boolean,
  fields: {
    [fieldName]: {
      valid: boolean,
      errors: string[],
      validity: {
        builtIn: ValidityState,
        customErrors: string[],
        allErrors: string[]
      }
    }
  }
}
```



## Warnings (предупреждения)

TrustValidator генерирует предупреждения при проблемах структуры формы:

* отсутствие `<label for>`
* отсутствие контейнера для ошибок
* конфликт HTML и JS-правил

```ts
form.addEventListener('trustvalidator:warning', (e) => {
  console.warn(e.detail.message);
});
```

---

## Тестирование

Проект покрыт тестами.

```bash
npm run test
```

---

## Структура проекта

```
src/
├── main.ts
├── app.ts                # Основной класс TrustValidator
├── types/
│   └── index.d.ts          # Типы и интерфейсы
└── tests/
    └── Validator.test.ts

```
