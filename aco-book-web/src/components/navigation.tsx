import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="ml-4">
      <ul className="flex">
        <li className="mx-2">
          <Link href="/"> 홈</Link>
        </li>
        <li className="mx-2">자산</li>
        <li className="mx-2">수입/지출</li>
        <li className="mx-2">저축</li>
        <li className="mx-2">정책</li>
        <li className="mx-2">계정 및 그룹</li>
      </ul>
    </nav>
  );
}
