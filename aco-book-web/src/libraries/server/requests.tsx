import { cookies } from "next/headers";
import { sendRequest } from "libraries/requests";
import { DataType, isDataType } from "libraries/utils";

async function sendServerRequest(
  route: string,
  method: string = "POST",
  requestBody: object = {}
) {
  const result = sendRequest(route, method, cookies().toString(), requestBody);
  return result;
}

export async function sendFormRequest(
  route: string,
  method: string = "POST",
  raw: HTMLFormElement
) {
  const formData = new FormData(raw);
  const requestBody: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    requestBody[key] = value.toString();
  });

  return await sendServerRequest(route, method, requestBody);
}

export async function sendIdsRequest(
  route: string,
  method: string = "DELETE",
  ids: Set<number>
) {
  return await sendServerRequest(route, method, { id: Array.from(ids) });
}

export async function sendObjectRequest(
  route: string,
  method: string = "POST",
  objectData: { [key: string]: number | string } = {}
) {
  return await sendServerRequest(route, method, objectData);
}

export interface DataTableRaw {
  columns: string[];
  data: Array<{ [key: string]: string | number }>;
  dtypes: { [key: string]: DataType };
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

    const isDtypesValid = Object.values(body.dtypes).every(isDataType);

    return isDataValid && isDtypesValid;
  }
  return false;
}

export async function getDataTable(route: string) {
  const raw = await sendServerRequest(route, "GET");
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
