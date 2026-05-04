import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="text-5xl">📅</div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Schedule Mate
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          カレンダーの空き時間を共有して、ミーティングの日程調整をかんたんに。
          ICSファイルをアップロードするだけで、予約ページを作成できます。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/create"
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-blue-700 transition-colors"
          >
            スケジュールページを作成
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 text-sm text-gray-500">
          <div className="space-y-1">
            <div className="text-2xl">📤</div>
            <p className="font-medium text-gray-700">ICSをアップロード</p>
            <p>カレンダーの予定を自動で読み取り</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔗</div>
            <p className="font-medium text-gray-700">URLを共有</p>
            <p>相手が空き時間を選んで予約</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">✉️</div>
            <p className="font-medium text-gray-700">メールで通知</p>
            <p>カレンダー招待を双方に自動送信</p>
          </div>
        </div>
      </div>
    </main>
  );
}
