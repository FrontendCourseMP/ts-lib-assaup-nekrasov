import { describe, it, expect } from "vitest";
import TrustValidator from "../app";

describe("TrustValidator", () => {
  it("валидирует обязательное текстовое поле", () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="text" name="username" />
      </form>
    `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("username", { required: true });

    const resultEmpty = validator.validate();
    expect(resultEmpty.valid).toBe(false);
    expect(resultEmpty.fields.username.errors).toContain("Поле обязательно");

    const input = form.querySelector<HTMLInputElement>(
      'input[name="username"]'
    )!;
    input.value = "John";

    const resultFilled = validator.validate();
    expect(resultFilled.valid).toBe(true);
  });

  it("валидирует числовое поле min/max", () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="number" name="age" />
      </form>
    `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("age", { min: 18, max: 99 });

    const input = form.querySelector<HTMLInputElement>('input[name="age"]')!;
    input.value = "10";
    let result = validator.validate();
    expect(result.valid).toBe(false);

    input.value = "50";
    result = validator.validate();
    expect(result.valid).toBe(true);

    input.value = "120";
    result = validator.validate();
    expect(result.valid).toBe(false);
  });

  it("валидирует чекбоксы (массив)", () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="checkbox" name="options" value="a" />
        <input type="checkbox" name="options" value="b" />
      </form>
    `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("options", { arrayMin: 1 });

    let result = validator.validate();
    expect(result.valid).toBe(false);

    const checkbox = form.querySelector<HTMLInputElement>(
      'input[name="options"][value="a"]'
    )!;
    checkbox.checked = true;

    result = validator.validate();
    expect(result.valid).toBe(true);
  });

  it("валидирует кастомные функции", () => {
    document.body.innerHTML = `
      <form id="form">
        <input type="text" name="password" />
      </form>
    `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("password", {
      custom: (value: string) =>
        /[A-Z]/.test(value) || "Должна быть заглавная буква",
    });

    const input = form.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    input.value = "abc";
    let result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.fields.password.errors).toContain(
      "Должна быть заглавная буква"
    );

    input.value = "Abc";
    result = validator.validate();
    expect(result.valid).toBe(true);
  });
  it("принимает граничные значения min/max", () => {
    document.body.innerHTML = `
    <form id="form">
      <input type="number" name="age" />
    </form>
  `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("age", { min: 18, max: 99 });

    const input = form.querySelector<HTMLInputElement>('input[name="age"]')!;

    input.value = "18";
    expect(validator.validate().valid).toBe(true);

    input.value = "99";
    expect(validator.validate().valid).toBe(true);
  });
  it("валидирует minLength и maxLength", () => {
    document.body.innerHTML = `
    <form id="form">
      <input type="text" name="username" />
    </form>
  `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("username", { minLength: 3, maxLength: 5 });

    const input = form.querySelector<HTMLInputElement>(
      'input[name="username"]'
    )!;

    input.value = "ab";
    expect(validator.validate().valid).toBe(false);

    input.value = "abcd";
    expect(validator.validate().valid).toBe(true);

    input.value = "abcdef";
    expect(validator.validate().valid).toBe(false);
  });
  it("валидирует pattern для строки", () => {
    document.body.innerHTML = `
    <form id="form">
      <input type="text" name="email" />
    </form>
  `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("email", {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    });

    const input = form.querySelector<HTMLInputElement>('input[name="email"]')!;

    input.value = "wrong-email";
    expect(validator.validate().valid).toBe(false);

    input.value = "test@example.com";
    expect(validator.validate().valid).toBe(true);
  });
  it("валидирует arrayMin и arrayMax", () => {
    document.body.innerHTML = `
    <form id="form">
      <input type="checkbox" name="options" value="a" />
      <input type="checkbox" name="options" value="b" />
      <input type="checkbox" name="options" value="c" />
    </form>
  `;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("options", { arrayMin: 2, arrayMax: 2 });

    const boxes = form.querySelectorAll<HTMLInputElement>(
      'input[name="options"]'
    );

    boxes[0].checked = true;
    expect(validator.validate().valid).toBe(false);

    boxes[1].checked = true;
    expect(validator.validate().valid).toBe(true);

    boxes[2].checked = true;
    expect(validator.validate().valid).toBe(false);
  });
  it("возвращает ошибку если поле не найдено", () => {
    document.body.innerHTML = `<form id="form"></form>`;

    const form = document.getElementById("form") as HTMLFormElement;
    const validator = new TrustValidator(form);

    validator.addField("missing", { required: true });

    const result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.fields.missing.errors[0]).toContain("не найдено");
  });
});
