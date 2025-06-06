import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Protected Page</h1>
        <p>You are signed in as {userId}.</p>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-8 text-red-500">
        <p>Error: {(err as Error).message}</p>
      </div>
    );
  }
}
