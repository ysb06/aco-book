"use client";

import { Dispatch, SetStateAction, useState } from "react";

interface InputFieldPropsBase {
  id: string;
  onStateChange?: Dispatch<SetStateAction<string>>;
  required?: boolean;
}

interface FieldProps extends InputFieldPropsBase {
  fieldName: string;
  labelText: string;
  inputType: string;
  autocomplete: string;
  placeholder: string;
}

interface SubmitButtonProps {
  id: string;
  children?: React.ReactNode;
}

interface UsernameFieldProps extends InputFieldPropsBase {
  autocomplete?: "off" | "username";
}

interface PasswordFieldProps extends InputFieldPropsBase {
  passwordType?: "off" | "new-password" | "current-password" | "one-time-code";
}

export default function FieldElement({
  id,
  fieldName,
  labelText,
  inputType,
  autocomplete,
  placeholder,
  onStateChange = () => {},
  required = false,
}: FieldProps) {
  const [content, setContent] = useState("");

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        id={`${id}-label`}
      >
        {labelText}
      </label>
      <input
        name={fieldName}
        type={inputType}
        id={id}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
        autoComplete={autocomplete}
        placeholder={placeholder}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onStateChange(e.target.value);
        }}
        required={required}
        aria-labelledby={`${id}-label`}
      />
    </div>
  );
}

export function SubmitButton({ id, children }: SubmitButtonProps) {
  return (
    <button
      id={id}
      type="submit"
      className="w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-indigo-600 border border-transparent rounded-lg active:bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:shadow-outline-indigo"
    >
      {children}
    </button>
  );
}

export function UsernameField({
  id,
  onStateChange = () => {},
  required = true,
  autocomplete = "username",
}: UsernameFieldProps) {
  return (
    <FieldElement
      id={id}
      fieldName="username"
      inputType="text"
      labelText="User ID"
      autocomplete={autocomplete}
      placeholder="Enter your username..."
      onStateChange={onStateChange}
      required={required}
    />
  );
}

export function PasswordField({
  id,
  onStateChange = () => {},
  required = true,
  passwordType = "current-password",
}: PasswordFieldProps) {
  return (
    <FieldElement
      id={id}
      fieldName="password"
      inputType="password"
      labelText="Password"
      autocomplete={passwordType}
      placeholder="Enter your password..."
      onStateChange={onStateChange}
      required={required}
    />
  );
}

export function NameField({
  id,
  onStateChange = () => {},
  required = true,
}: InputFieldPropsBase) {
  return (
    <FieldElement
      id={id}
      fieldName="name"
      inputType="text"
      labelText="Name"
      autocomplete="name"
      placeholder="Enter your name..."
      onStateChange={onStateChange}
      required={required}
    />
  );
}

export function NicknameField({
  id,
  onStateChange = () => {},
  required = true,
}: InputFieldPropsBase) {
  return (
    <FieldElement
      id={id}
      fieldName="nickname"
      inputType="text"
      labelText="Nickname"
      autocomplete="nickname"
      placeholder="Enter your nickname..."
      onStateChange={onStateChange}
      required={required}
    />
  );
}

export function EMailField({
  id,
  onStateChange = () => {},
  required = true,
}: InputFieldPropsBase) {
  return (
    <FieldElement
      id={id}
      fieldName="email"
      inputType="text"
      labelText="E-Mail"
      autocomplete="email"
      placeholder="Enter your E-Mail Address..."
      onStateChange={onStateChange}
      required={required}
    />
  );
}
