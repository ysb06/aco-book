import { sendRequest } from "libraries/requests";

async function sendClientRequest(
  route: string,
  method: string = "POST",
  requestBody: object,
) {
  const result = sendRequest(route, method, document.cookie, requestBody);
  return result;
}

export async function sendFormRequest(
  route: string,
  method: string = "POST",
  raw: HTMLFormElement,
) {
  const formData = new FormData(raw);
  const requestBody: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    requestBody[key] = value.toString();
  });

  return await sendClientRequest(route, method, requestBody);
}

export async function sendIdsRequest(
  route: string,
  method: string = "DELETE",
  ids: Set<number>,
) {
  return await sendClientRequest(route, method, { id: Array.from(ids) });
}

export async function sendObjectRequest(
  route: string,
  method: string = "POST",
  object: { [key: string]: number | string } = {},
) {
  return await sendClientRequest(route, method, object);
}