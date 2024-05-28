import Link from "next/link";

interface LinkListProps {
  href: string;
  children?: React.ReactNode;
}

export function LinkList({ href, children }: LinkListProps) {
  return (
    <li className="text-blue-500 hover:underline">
      <Link href={href}>{children}</Link>
    </li>
  );
}
