import { LoginStatus } from "components/server/account/status";
import { LinkList } from "components/server/utils";
import { cookies } from "next/headers";


export default function Home() {  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <nav className="ml-4">
        <ul className="flex">
          <li className="mx-2">
            <div className="text-xl font-bold">계정 및 그룹</div>
            <ul>
              <LinkList href="/account/register/">회원가입</LinkList>
              <LinkList href="/account/login/">로그인</LinkList>
              <li className="text-gray-500">프로필</li>
              <LinkList href="/group/">그룹 관리</LinkList>
              <li className="text-gray-500">그룹 가입</li>
              <li className="text-gray-500">그룹 가입 승인</li>
            </ul>
          </li>
          <li className="mx-2">
            <div className="text-xl font-bold">자산</div>
            <ul>
              <LinkList href="/asset/">자산 관리</LinkList>
              <LinkList href="/record">자산 기록</LinkList>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
        <p className="text-lg">This is the content of the home page.</p>
      </div>
      <LoginStatus />
    </main>
  );
}