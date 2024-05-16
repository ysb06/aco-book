import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="ml-4">
      <ul className="flex space-x-4">
        <li>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            홈
          </Link>
        </li>
        <li>
          <span className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold cursor-pointer">
            자산
          </span>
        </li>
        <li>
          <span className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold cursor-pointer">
            수입/지출
          </span>
        </li>
        <li>
          <span className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold cursor-pointer">
            저축
          </span>
        </li>
        <li>
          <span className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold cursor-pointer">
            정책
          </span>
        </li>
        <li>
          <span className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold cursor-pointer">
            계정 및 그룹
          </span>
        </li>
      </ul>
    </nav>
  );
}
