import { cookies } from "next/headers";

export async function fetchByServer(route: string) {
  const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
  const token = cookies().get("token")?.value;

  const headers: { "Content-Type": string; Cookie?: string } = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Cookie"] = `token=${token}`;
  }

  const requestJSON: RequestInit = {
    method: "GET",
    headers: headers,
    credentials: "include",
  };

  const response = await fetch(`${serverAddress}${route}`, requestJSON);
  const responseBody = await response.json();
  const result = {
    ok: response.ok,
    status: response.status,
    body: responseBody,
  }

  return result;
}
