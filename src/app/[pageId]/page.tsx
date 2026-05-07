import { notFound } from "next/navigation";
import BookingPage from "@/components/BookingPage";

type Props = { params: Promise<{ pageId: string }> };

async function getPageData(pageId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/scheduling-pages/${pageId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) return null;
    if (data.calendarUnavailable) return { calendarUnavailable: true };
    return null;
  }
  return res.json();
}

export default async function BookingPageRoute({ params }: Props) {
  const { pageId } = await params;
  const pageData = await getPageData(pageId);

  if (!pageData) notFound();

  if ("calendarUnavailable" in pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-4xl">📅</p>
          <h1 className="text-xl font-bold text-gray-900">
            カレンダーの読み込みに失敗しました
          </h1>
          <p className="text-gray-500 text-sm">
            カレンダーデータを取得できませんでした。しばらく経ってから再度お試しください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <BookingPage pageData={pageData} />
    </div>
  );
}
