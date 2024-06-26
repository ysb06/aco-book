import { cookies } from "next/headers";
import { getDataTable } from "libraries/server/requests";
import { DataTable } from "components/client/table";

export default async function GroupPage() {
  const userInfoRaw = cookies().get("userinfo")?.value;
  let decodedInfo = userInfoRaw ? decodeURIComponent(userInfoRaw) : '{"nickname": "Unknown"}';
  let nickname = JSON.parse(decodedInfo).nickname;
  const result = await getDataTable("groups/");

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {nickname}의 그룹 목록
      </h1>
      <div className="max-w-4xl">
        {result.ok ? (
          <DataTable
            id="data"
            raw={result.body}
            path="groups"
            schema={["name"]}
          />
        ) : (
          <div>{result.status} Error</div>
        )}
      </div>
    </main>
  );
}
// Todo: 매달 고정 수입 및 지출도 추가 (요청 시 업데이트하는 형태로)
// Todo: 카드값과 같은 정해지지 않은 정기 수입 및 지출도 추가
