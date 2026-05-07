import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ token?: string }>;
};

function formatDateTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function ManagePage({ params, searchParams }: Props) {
  const { pageId } = await params;
  const { token } = await searchParams;

  const page = await prisma.schedulingPage.findUnique({
    where: { id: pageId },
    include: {
      bookings: {
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!page) notFound();
  if (!token || token !== page.manageToken) redirect(`/${pageId}`);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const publicUrl = `${baseUrl}/${page.slug ?? pageId}`;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{page.title}</h1>
          <p className="text-gray-500 text-sm mt-1">スケジュールページの管理</p>
        </div>

        {/* Public URL */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">予約ページのURL</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={publicUrl}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700"
            />
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              開く
            </a>
          </div>
          <p className="text-xs text-gray-400">
            このURLを相手に共有してください。このページのURLは秘密にしてください（管理者のみアクセス可能）。
          </p>
        </div>

        {/* Page details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">設定内容</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="text-gray-500 w-28 shrink-0">所要時間</dt>
              <dd className="text-gray-900">{page.durationMinutes}分</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 w-28 shrink-0">タイムゾーン</dt>
              <dd className="text-gray-900">{page.timezone}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 w-28 shrink-0">受付期間</dt>
              <dd className="text-gray-900">
                {page.availableFrom.toLocaleDateString("ja-JP")} 〜{" "}
                {page.availableTo.toLocaleDateString("ja-JP")}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 w-28 shrink-0">稼働時間</dt>
              <dd className="text-gray-900">
                {page.workingHoursStart}:00 〜 {page.workingHoursEnd}:00
              </dd>
            </div>
            {page.meetingUrl && (
              <div className="flex gap-4">
                <dt className="text-gray-500 w-28 shrink-0">会議URL</dt>
                <dd className="text-blue-600 break-all">
                  <a href={page.meetingUrl} target="_blank" rel="noopener noreferrer">
                    {page.meetingUrl}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            予約一覧 ({page.bookings.filter((b) => b.status === "CONFIRMED").length}件)
          </h2>
          {page.bookings.length === 0 ? (
            <p className="text-gray-400 text-sm">まだ予約はありません</p>
          ) : (
            <div className="space-y-3">
              {page.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-4 text-sm ${
                    booking.status === "CANCELLED"
                      ? "border-gray-100 bg-gray-50 opacity-60"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{booking.attendeeName}</p>
                      <p className="text-gray-500">{booking.attendeeEmail}</p>
                      <p className="text-gray-700">
                        {formatDateTime(booking.startTime, page.timezone)} 〜{" "}
                        {new Intl.DateTimeFormat("ja-JP", {
                          timeZone: page.timezone,
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(booking.endTime)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {booking.status === "CONFIRMED" ? "確定" : "キャンセル"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
