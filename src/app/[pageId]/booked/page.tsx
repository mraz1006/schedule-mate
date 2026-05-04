import Link from "next/link";

type Props = { params: Promise<{ pageId: string }> };

export default async function BookedPage({ params }: Props) {
  const { pageId } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900">予約が完了しました</h1>
        <p className="text-gray-500 leading-relaxed">
          ご予約ありがとうございます。
          確認メールとカレンダー招待状（.ics）を双方のメールアドレスに送信しました。
        </p>
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
