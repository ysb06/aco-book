import { cookies } from "next/headers";

export function isSessionAlive() {
  const cookie = cookies().get("token");
  const result = cookie !== undefined;
  if (!result) {
    
  }
  return result;
}