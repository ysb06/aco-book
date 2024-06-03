export async function sendRequest(
  route: string,
  method: string = "POST",
  cookie: string | undefined = undefined,
  requestBody: object,
) {
  const url = new URL(route, process.env.NEXT_PUBLIC_SERVER_ADDRESS);
  const headers: { "Content-Type": string; Cookie?: string } = {
    "Content-Type": "application/json",
  };
  const requestRaw: RequestInit = {
    method: method,
    headers: headers,
    credentials: "include",
  };
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  if (method !== "GET") {
    requestRaw["body"] = JSON.stringify(requestBody);
  }

  const response = await fetch(url, requestRaw);
  const responseBody = await response.json();
  const result = {
    ok: response.ok,
    status: response.status,
    body: responseBody,
  };

  return result;
}
