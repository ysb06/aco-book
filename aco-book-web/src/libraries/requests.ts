export async function sendRequest(
  route: string,
  requestBody: object,
  method: string = "POST",
  cookie: string | undefined = undefined
) {
  const url = new URL(route, process.env.NEXT_PUBLIC_SERVER_ADDRESS);
  const headers: { "Content-Type": string; Cookie?: string } = {
    "Content-Type": "application/json",
  };
  const requestRaw: RequestInit = {
    method: method,
    headers: headers,
  };
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  // token === credentials
  if (headers["Cookie"] && headers["Cookie"].includes("token")) {
    requestRaw["credentials"] = "include";
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
