"use client";

import { LoginForm } from "components/account/account";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm />
    </main>
  );
}
