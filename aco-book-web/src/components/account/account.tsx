"use client";

import { NameField, PasswordInput, SumbitButton, UsernameInput } from "./input";

interface LoginProps {
  onSubmit: (userId: string, password: string) => void; // 이벤트 핸들러를 props로 전달
}

export function LoginForm() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // const response = await fetch('http://127.0.0.1:8000/token/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ username: 'userId', password: 'password' })
    // });

    // const data = await response.json();
    // if (response.ok) {
    //   // 토큰을 쿠키 또는 로컬 스토리지에 저장
    //   document.cookie = `token=${data.token}; secure; httponly`;
    //   console.log('Login Success:', data);
    //   console.log('Token:', data.token);
    //   console.log('cookie:', document.cookie);
    // } else {
    //   // 에러 처리
    //   alert(data.detail);
    // }
    console.log('Login Success:', 'data');
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit}>
        <UsernameInput id="login-id" />
        <PasswordInput id="login-password" />
        <SumbitButton id="login-submit" />
      </form>
    </div>
  );
}

interface SignUpProps {
  id?: string;
}

export function SignUpForm({ id = "signup-form" }: SignUpProps) {
  return (
    <div id={id} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <form>
        <UsernameInput id={id + "-id"} />
        <PasswordInput id={id + "-password"} />
        <NameField id={id + "-name"} />
        <SumbitButton id={id + "-submit"}>Sign Up</SumbitButton>
      </form>
    </div>
  );
}
