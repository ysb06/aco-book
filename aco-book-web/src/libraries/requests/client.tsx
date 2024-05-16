import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export function generateFormRequest(
  raw: HTMLFormElement,
  method: string = "POST",
  includeCredentials: boolean = true,
  cookie: RequestCookie | undefined = undefined
) {
  const formData = new FormData(raw);
  const reqBody: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    reqBody[key] = value.toString();
  });

  const req: RequestInit = {
    method: method,
    headers: cookie
      ? {
          "Content-Type": "application/json",
          Cookie: cookie?.name + "=" + cookie?.value,
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  };

  if (includeCredentials) {
    req.credentials = "include";
  }

  return req;
}

export function generateRequest(
  method: string = "POST",
  requestBody: { [key: string]: string } = {},
  includeCredentials: boolean = true,
  cookie: RequestCookie | undefined = undefined
) {
  const req: RequestInit = {
    method: method,
    headers: cookie
      ? {
          "Content-Type": "application/json",
          Cookie: cookie?.name + "=" + cookie?.value,
        }
      : { "Content-Type": "application/json" },
  };

  if (method !== "GET") {
    req.body = JSON.stringify(requestBody);
  }

  if (includeCredentials) {
    req.credentials = "include";
  }
  return req;
}
