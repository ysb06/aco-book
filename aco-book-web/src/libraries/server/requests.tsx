import { cookies } from "next/headers";
import { sendRequest } from "libraries/requests";

async function sendServerRequest(
  route: string,
  requestBody: object,
  method: string = "POST"
) {
  const result = sendRequest(route, requestBody, method, cookies().toString());
  return result;
}

export async function sendFormRequest(
  route: string,
  raw: HTMLFormElement,
  method: string = "POST"
) {
  const formData = new FormData(raw);
  const requestBody: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    requestBody[key] = value.toString();
  });

  return await sendServerRequest(route, requestBody, method);
}

export async function sendIdsRequest(
  route: string,
  ids: Set<number>,
  method: string = "DELETE"
) {
  return await sendServerRequest(route, { id: Array.from(ids) }, method);
}

export async function sendObjectRequest(
  route: string,
  object: { [key: string]: number | string },
  method: string = "POST"
) {
  return await sendServerRequest(route, object, method);
}
// ----------------------------------------------







type RequestData = Set<number> | { [key: string]: number | string };

export interface DataTableRaw {
  data: Array<{ [key: string]: string | number }>;
  columns: string[];
  dtypes: { [key: string]: string };
}

function isDataTableResponse(body: any): body is DataTableRaw {
  if (
    typeof body === "object" &&
    body !== null &&
    Array.isArray(body.data) &&
    Array.isArray(body.columns) &&
    typeof body.dtypes === "object" &&
    body.dtypes !== null &&
    !Array.isArray(body.dtypes)
  ) {
    const isDataValid = body.data.every(
      (item: any) =>
        typeof item === "object" &&
        item !== null &&
        Object.values(item).every(
          (val) => typeof val === "string" || typeof val === "number"
        )
    );
    const areDtypesValid = Object.values(body.dtypes).every(
      (val) => typeof val === "string"
    );
    return isDataValid && areDtypesValid;
  }
  return false;
}

export async function requestToServer(
  route: string,
  requestContent: RequestData,
  method: string = "POST"
) {
  const url = new URL(route, process.env.NEXT_PUBLIC_SERVER_ADDRESS);
  const token = cookies().get("token")?.value;
  const headers: { "Content-Type": string; Cookie?: string } = {
    "Content-Type": "application/json",
  };
  const requestRaw: RequestInit = {
    method: method,
    headers: headers,
  };
  if (token) {
    headers["Cookie"] = `token=${token}`;
    requestRaw["credentials"] = "include";
  }

  let requestBody = {};
  if (requestContent instanceof Set) {
    requestBody = { ids: Array.from(requestContent) };
  } else if (typeof requestContent === "object") {
    requestBody = requestContent;
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

function getBodyForDatum(contents: { [key: string]: number | string }) {

}

function getBodyForIds(contents: Set<number>) {
  // Todo: Delete 함수 구현 후 완성
}

export async function getDataTable(route: string) {
  const raw = await getFromServer(route);
  const resultBody = raw.ok && isDataTableResponse(raw.body) ? raw.body : null;
  return { ok: raw.ok, status: raw.status, body: resultBody };
}

export async function getFromServer(route: string) {
  const url = new URL(route, process.env.NEXT_PUBLIC_SERVER_ADDRESS);

  const token = cookies().get("token")?.value;
  const headers: { "Content-Type": string; Cookie?: string } = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Cookie"] = `token=${token}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
    credentials: "include",
  });

  const responseBody = await response.json();
  const result = {
    ok: response.ok,
    status: response.status,
    body: responseBody,
  };

  return result;
}
