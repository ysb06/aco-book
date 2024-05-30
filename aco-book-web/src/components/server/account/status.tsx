import { sendObjectRequest } from "libraries/server/requests";
import Link from "next/link";

interface LoginStatusProps {
  url?: string;
}

export async function SimpleLoginStatus({ url = "token/" }: LoginStatusProps) {
  const response = await sendObjectRequest(url, {}, "GET");

  return (
    <p className="text-gray-700 dark:text-gray-300 text-sm">
      {response.body.detail ? <Link href="/account/login/">Not Logined</Link> : 'Logined'}
    </p>
  );
}

export async function LoginStatus({ url = "token/" }: LoginStatusProps) {
  const response = await sendObjectRequest(url, {}, "GET");

  return (
    <div className="flex items-center justify-center">
      <p className="text-gray-700 dark:text-gray-300 text-sm">Login: </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {JSON.stringify(response.body)}
      </p>
    </div>
  );
}
