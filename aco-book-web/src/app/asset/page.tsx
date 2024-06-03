import { cookies } from "next/headers";
import { sendObjectRequest } from "libraries/server/requests";
import { DataTable } from "components/client/table";

export default async function AssetPage() {
  const userInfoRaw = cookies().get("userinfo")?.value;
  let decodedInfo = userInfoRaw ? decodeURIComponent(userInfoRaw) : '{"nickname": "Unknown"}';
  let nickname = JSON.parse(decodedInfo).nickname;
  const result = await sendObjectRequest("assets/", "GET", {});

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {nickname}의 자산 목록
      </h1>
      <div className="overflow-x-auto overflow-y-auto">
        {result.ok ? (
          <DataTable
            id="data"
            raw={result.body}
            path="assets/"
            schema={["owner_group_id", "name", "asset_type", "currency"]}
          />
        ) : (
          <div>{result.status} Error</div>
        )}
      </div>
    </main>
  );
}
