import exp from "constants";
import { generateRequest } from "libraries/requests/client";
import { cookies } from "next/headers";
import Link from "next/link";

interface LoginStatusProps {
  url?: string;
}

export async function SimpleLoginStatus({ url = "token/" }: LoginStatusProps) {
  const requestMessage = generateRequest(
    "GET",
    {},
    true,
    cookies().get("token")
  );
  const response = await fetch(
    process.env.NEXT_PUBLIC_SERVER_ADDRESS + url,
    requestMessage
  );
  const result = await response.json();

  return (
    <p className="text-gray-700 dark:text-gray-300 text-sm">
      {result.detail ? <Link href="/account/login/">Not Logined</Link> : 'Logined'}
    </p>
  );
}

export async function LoginStatus({ url = "token/" }: LoginStatusProps) {
  const requestMessage = generateRequest(
    "GET",
    {},
    true,
    cookies().get("token")
  );
  // Todo: Cookie가 직접 설정 안 해도 잘 작동하는지 확인
  const response: Response = await fetch(
    process.env.NEXT_PUBLIC_SERVER_ADDRESS + url,
    requestMessage
  );
  const result = await response.json();

  return (
    <div className="flex items-center justify-center">
      <p className="text-gray-700 dark:text-gray-300 text-sm">Login: </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {JSON.stringify(result)}
      </p>
    </div>
  );
}
