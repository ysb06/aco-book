"use client";

import { SignUpForm } from "components/account/account";

function handleSubmit(userId: string, password: string) {
  console.log("Login Attempt:", userId, password);
  // 실제 로그인 처리 로직
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <SignUpForm />
    </main>
  );
}
