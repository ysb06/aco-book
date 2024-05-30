import { sendRequest } from "libraries/requests";
async function sendClientRequest(
  route: string,
  requestBody: object,
  method: string = "POST"
) {
  const result = sendRequest(route, requestBody, method, document.cookie);
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

  return await sendClientRequest(route, requestBody, method);
}

export async function sendIdsRequest(
  route: string,
  ids: Set<number>,
  method: string = "DELETE"
) {
  return await sendClientRequest(route, { id: Array.from(ids) }, method);
}

export async function sendObjectRequest(
  route: string,
  object: { [key: string]: number | string },
  method: string = "POST"
) {
  return await sendClientRequest(route, object, method);
}