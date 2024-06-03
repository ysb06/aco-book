import { cookies } from "next/headers";
import { sendObjectRequest } from "libraries/server/requests";
import { DataTable } from "components/client/table";

export default async function RecordPage() {
  const userInfoRaw = cookies().get("userinfo")?.value;
  let decodedInfo = userInfoRaw
    ? decodeURIComponent(userInfoRaw)
    : '{"nickname": "Unknown"}';
  let nickname = JSON.parse(decodedInfo).nickname;
  const result = await sendObjectRequest("records/", "GET", {});

  const url = new URL("records/export", process.env.NEXT_PUBLIC_SERVER_ADDRESS);
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {nickname}의 자산 목록
      </h1>
      <div className="overflow-auto max-h-[70vh] w-full">
        {result.ok ? (
          <DataTable
            id="data"
            raw={result.body}
            path="records/"
            schema={[
              "asset_id",
              "date",
              "category",
              "payment_amount",
              "currency",
              "approved_amount",
            ]}
          />
        ) : (
          <div>{result.status} Error</div>
        )}
      </div>
      <a
        href={url.toString()}
        target="_blank"
        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        To Excel
      </a>
    </main>
  );
}
