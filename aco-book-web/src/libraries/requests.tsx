export function generateFormRequest(
  raw: HTMLFormElement,
  method: string = "POST",
  includeCredentials: boolean = true
) {
  const formData = new FormData(raw);
  const reqBody: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    reqBody[key] = value.toString();
  });

  const req: RequestInit = {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  };

  if (includeCredentials) {
    req.credentials = "include";
  }

  return req;
}

export function generateRequest(
  requestBody: { [key: string]: string } = {},
  method: string = "POST",
  includeCredentials: boolean = true,
  cookie: string,
) {
  const req: RequestInit = {
    method: method,
    headers: { "Content-Type": "application/json", "Cookie": cookie },
  };

  if (method !== "GET") {
    req.body = JSON.stringify(requestBody);
  }

  if (includeCredentials) {
    req.credentials = "include";
  }

  return req;
}
