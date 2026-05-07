import Link from "next/link";

type Props = {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{
    title?: string;
    organizer?: string;
    start?: string;
    end?: string;
    tz?: string;
    meetingUrl?: string;
  }>;
};

function buildGoogleCalendarUrl(params: {
  title: string;
  start: string;
  end: string;
  meetingUrl?: string;
}): string {
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${fmt(params.start)}/${fmt(params.end)}`,
    ...(params.meetingUrl ? { location: params.meetingUrl } : {}),
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function buildIcsDataUrl(params: {
  title: string;
  start: string;
  end: string;
  organizer: string;
  meetingUrl?: string;
}): string {
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Schedule Mate//JA",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(params.start)}`,
    `DTEND:${fmt(params.end)}`,
    `SUMMARY:${params.title}`,
    `ORGANIZER:${params.organizer}`,
    ...(params.meetingUrl ? [`LOCATION:${params.meetingUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const ics = lines.join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export default async function BookedPage({ params, searchParams }: Props) {
  const { pageId } = await params;
  const { title, organizer, start, end, tz, meetingUrl } = await searchParams;

  const timezone = tz ?? "Asia/Tokyo";

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: timezone,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const hasDetails = title && organizer && start && end;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900">予約が完了しました</h1>
        <p className="text-gray-500 leading-relaxed">
          ご予約ありがとうございます。確認メールとカレンダー招待状（.ics）を双方のメールアドレスに送信しました。
        </p>

        {hasDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left space-y-3 text-sm">
            <p className="font-semibold text-gray-900 text-base">{title}</p>
            <div className="space-y-1 text-gray-700">
              <p>
                <span className="text-gray-500 mr-2">主催者</span>
                {organizer}
              </p>
              <p>
                <span className="text-gray-500 mr-2">開始</span>
                {formatTime(start)}
              </p>
              <p>
                <span className="text-gray-500 mr-2">終了</span>
                {formatTime(end)}
              </p>
              {meetingUrl && (
                <p>
                  <span className="text-gray-500 mr-2">会議URL</span>
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {meetingUrl}
                  </a>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={buildGoogleCalendarUrl({ title, start, end, meetingUrl })}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-white border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Google カレンダーに追加
              </a>
              <a
                href={buildIcsDataUrl({ title, start, end, organizer, meetingUrl })}
                download="meeting.ics"
                className="block text-center bg-white border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                .ics をダウンロード
              </a>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          メールが届かない場合は迷惑メールフォルダをご確認ください。
        </div>

        <Link
          href={`/${pageId}`}
          className="inline-block text-blue-600 text-sm hover:underline"
        >
          ← 予約ページに戻る
        </Link>
      </div>
    </div>
  );
}
