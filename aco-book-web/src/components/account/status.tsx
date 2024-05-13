import { generateRequest } from "libraries/requests";
import { isSessionAlive } from "libraries/session";
import { cookies } from "next/headers";

export async function LoginStatus() {
  const isSessionExist = isSessionAlive()
  let result = {};
  if (isSessionExist) {
    const req = generateRequest({}, "GET", true, cookies().toString());
    console.log(req);
    const response: Response = await fetch(
      process.env.NEXT_PUBLIC_SERVER_ADDRESS + "/token",
      req
    );
  }

  return (
    <div className="flex items-center justify-center">
      <p className="text-gray-700 dark:text-gray-300 text-sm">Login: </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {isSessionExist ? "True" : "False"}
      </p>
      {JSON.stringify(result)}
    </div>
  );
}
