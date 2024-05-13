"use client";

import { NextPageContext } from "next";
import { cookies } from "next/headers";

export default async function StatusPage() {
  const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
  const response = await fetch(serverAddress + "/token", {
    method: "GET",
  });
  const data = await response.json();
  console.log(data);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Status Page
    </main>
  );
}

StatusPage.getInitialProps = (context: NextPageContext) => {
  console.log(context);
};
