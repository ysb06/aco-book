"use client";

import { FormEvent } from "react";
import {
  EMailField,
  NameField,
  NicknameField,
  PasswordField,
  SubmitButton,
  UsernameField,
} from "./input";
import { useRouter } from "next/navigation";
import { generateFormRequest } from "libraries/requests/client";

interface AccountFormProps {
  id?: string;
  redirectRoute?: string;
  // setSuccess?: Dispatch<SetStateAction<boolean>>;
}

export function LoginForm({
  id = "login-form",
  redirectRoute = "/",
}: AccountFormProps) {
  const router = useRouter();

  const handleSubmitButton = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    const requestJSON = generateFormRequest(event.currentTarget);
    const response = await fetch(serverAddress + "token/", requestJSON);
    if (response.ok) {
      router.push(redirectRoute);
      router.refresh();
    } else {
      console.log("Error with status:", response.status);
    }
  };

  return (
    <div
      id={id}
      className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
    >
      <form onSubmit={handleSubmitButton}>
        <UsernameField id="login-id" />
        <PasswordField id="login-password" />
        <SubmitButton id="login-submit">Login</SubmitButton>
      </form>
    </div>
  );
}

export function SignUpForm({
  id = "signup-form",
  redirectRoute = "/account/login/",
}: AccountFormProps) {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    const requestJSON = generateFormRequest(event.currentTarget);
    const response = await fetch(serverAddress + "users/", requestJSON);
    if (response.ok) {
      router.push(redirectRoute);
      router.refresh();
    } else {
      console.log("Error with status:", response.status);
    }
  };

  return (
    <div
      id={id}
      className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
    >
      <form onSubmit={handleSubmit}>
        <UsernameField id={id + "-username"} />
        <PasswordField id={id + "-password"} />
        <EMailField id={id + "-email"} />
        <NameField id={id + "-name"} />
        <NicknameField id={id + "-nickname"} />
        <SubmitButton id={id + "-submit"}>Sign Up</SubmitButton>
      </form>
    </div>
  );
}
